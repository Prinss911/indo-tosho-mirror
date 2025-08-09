import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async event => {
    try {
        // Validate admin access
        const user = await serverSupabaseUser(event);
        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized"
            });
        }

        // Check if user is admin
        const userSupabase = await serverSupabaseClient(event);
        const { data: userProfile, error: profileError } = await userSupabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !userProfile || userProfile.role !== "admin") {
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden: Only admins can apply RLS policies"
            });
        }

        // Get service role key
        const config = useRuntimeConfig();
        const serviceRoleKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            throw createError({
                statusCode: 500,
                statusMessage: "Server configuration error: Service role key not found"
            });
        }

        // Create admin client with service role
        const adminSupabase = createClient(
            config.public.supabase.url,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        console.log("[ADMIN] Applying RLS policies for profiles table...");

        // Apply RLS policies using raw SQL
        const rlsPolicies = [
            // Drop existing policies if any
            `DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;`,
            `DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;`,
            `DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;`,
            `DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;`,
            `DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;`,
            `DROP POLICY IF EXISTS "Service role can access all profiles" ON public.profiles;`,
            
            // Create new policies
            `CREATE POLICY "Users can view own profile" ON public.profiles
                FOR SELECT USING (auth.uid() = id);`,
            
            `CREATE POLICY "Users can update own profile" ON public.profiles
                FOR UPDATE USING (auth.uid() = id);`,
            
            `CREATE POLICY "Users can insert own profile" ON public.profiles
                FOR INSERT WITH CHECK (auth.uid() = id);`,
            
            `CREATE POLICY "Admins can view all profiles" ON public.profiles
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles 
                        WHERE id = auth.uid() AND role = 'admin'
                    )
                );`,
            
            `CREATE POLICY "Admins can update all profiles" ON public.profiles
                FOR UPDATE USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles 
                        WHERE id = auth.uid() AND role = 'admin'
                    )
                );`,
            
            `CREATE POLICY "Service role can access all profiles" ON public.profiles
                FOR ALL USING (auth.role() = 'service_role');`
        ];

        const results = [];
        
        for (const policy of rlsPolicies) {
            try {
                const { data, error } = await adminSupabase.rpc('exec_sql', {
                    sql: policy
                });
                
                if (error) {
                    console.warn(`[ADMIN] Policy execution warning:`, error);
                    // Continue with other policies even if one fails
                }
                
                results.push({
                    policy: policy.substring(0, 50) + '...',
                    success: !error,
                    error: error?.message || null
                });
            } catch (err) {
                console.error(`[ADMIN] Error executing policy:`, err);
                results.push({
                    policy: policy.substring(0, 50) + '...',
                    success: false,
                    error: err.message
                });
            }
        }

        // Log the operation
        try {
            await adminSupabase
                .from("profiles_operation_log")
                .insert({
                    operation_type: "rls_policies_applied",
                    user_id: user.id,
                    operation_data: {
                        table: "profiles",
                        policies_applied: results.filter(r => r.success).length,
                        total_policies: results.length,
                        results: results
                    }
                });
        } catch (logError) {
            console.warn("[ADMIN] Failed to log operation:", logError);
        }

        console.log("[ADMIN] RLS policies application completed");

        return {
            success: true,
            message: "RLS policies applied successfully",
            results: results,
            summary: {
                total: results.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length
            }
        };

    } catch (error) {
        console.error("[ADMIN] Error applying RLS policies:", error);
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to apply RLS policies: ${error.message}`
        });
    }
});