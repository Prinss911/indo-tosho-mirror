-- Migration: Create profiles_operation_log table
-- Description: Table untuk menyimpan log operasi dan aktivitas pengguna
-- Created: 2025-01-30

-- Create profiles_operation_log table
CREATE TABLE IF NOT EXISTS public.profiles_operation_log (
    id BIGSERIAL PRIMARY KEY,
    operation_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    operation_data JSONB DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_operation_log_user_id ON public.profiles_operation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_operation_log_operation_type ON public.profiles_operation_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_profiles_operation_log_created_at ON public.profiles_operation_log(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles_operation_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only view their own operation logs
CREATE POLICY "Users can view own operation logs" ON public.profiles_operation_log
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only authenticated users can insert operation logs
CREATE POLICY "Authenticated users can insert operation logs" ON public.profiles_operation_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Admins can view all operation logs
CREATE POLICY "Admins can view all operation logs" ON public.profiles_operation_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE public.profiles_operation_log IS 'Log operasi dan aktivitas pengguna untuk audit trail';
COMMENT ON COLUMN public.profiles_operation_log.id IS 'Primary key dengan auto increment';
COMMENT ON COLUMN public.profiles_operation_log.operation_type IS 'Jenis operasi yang dilakukan (login, logout, create_post, etc.)';
COMMENT ON COLUMN public.profiles_operation_log.user_id IS 'ID pengguna yang melakukan operasi';
COMMENT ON COLUMN public.profiles_operation_log.operation_data IS 'Data tambahan operasi dalam format JSON';
COMMENT ON COLUMN public.profiles_operation_log.error_message IS 'Pesan error jika operasi gagal';
COMMENT ON COLUMN public.profiles_operation_log.created_at IS 'Waktu operasi dilakukan';