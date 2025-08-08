-- Migration: Add RLS policies for profiles table
-- Description: Menambahkan policies untuk mengizinkan akses ke tabel profiles
-- Created: 2025-01-31
-- Issue: Error 406 pada request ke profiles table karena tidak ada RLS policies

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Allow authenticated users to insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Service role can access all profiles (for server-side operations)
CREATE POLICY "Service role can access all profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Mengizinkan user melihat profil mereka sendiri';
COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 'Mengizinkan admin melihat semua profil';
COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 'Mengizinkan user mengupdate profil mereka sendiri';
COMMENT ON POLICY "Admins can update all profiles" ON public.profiles IS 'Mengizinkan admin mengupdate semua profil';
COMMENT ON POLICY "Users can insert own profile" ON public.profiles IS 'Mengizinkan user membuat profil mereka sendiri saat registrasi';
COMMENT ON POLICY "Service role can access all profiles" ON public.profiles IS 'Mengizinkan service role akses penuh untuk operasi server-side';