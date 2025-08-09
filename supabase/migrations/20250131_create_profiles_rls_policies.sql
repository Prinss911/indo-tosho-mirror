-- Migration: Create RLS policies for profiles table
-- Description: Menambahkan kebijakan Row Level Security untuk tabel profiles
-- Created: 2025-01-31
-- Fix: Error 500 saat mengambil profil pengguna karena tidak ada RLS policies

-- Create RLS policies for profiles table

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Service role can bypass RLS (for server-side operations)
-- Note: This policy allows service role to access all profiles
CREATE POLICY "Service role can access all profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Pengguna dapat melihat profil mereka sendiri';
COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 'Pengguna dapat mengupdate profil mereka sendiri';
COMMENT ON POLICY "Users can insert own profile" ON public.profiles IS 'Pengguna dapat membuat profil mereka sendiri';
COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 'Admin dapat melihat semua profil';
COMMENT ON POLICY "Admins can update all profiles" ON public.profiles IS 'Admin dapat mengupdate semua profil';
COMMENT ON POLICY "Service role can access all profiles" ON public.profiles IS 'Service role dapat mengakses semua profil untuk operasi server-side';

-- Log this migration
INSERT INTO public.profiles_operation_log (operation_type, operation_data, created_at)
VALUES (
    'migration_rls_policies_created',
    '{"table": "profiles", "policies_count": 6, "description": "Created RLS policies for profiles table to fix 500 error on profile fetch"}'::jsonb,
    NOW()
);