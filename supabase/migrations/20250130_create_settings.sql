-- Migration: Create settings table
-- Description: Table untuk menyimpan konfigurasi aplikasi dalam format key-value
-- Created: 2025-01-30

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON public.settings(updated_at DESC);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Only admins can view settings
CREATE POLICY "Only admins can view settings" ON public.settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can insert settings
CREATE POLICY "Only admins can insert settings" ON public.settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can update settings
CREATE POLICY "Only admins can update settings" ON public.settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can delete settings
CREATE POLICY "Only admins can delete settings" ON public.settings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
    ('registration_enabled', 'true'::jsonb, 'Mengatur apakah registrasi pengguna baru diizinkan'),
    ('site_maintenance', 'false'::jsonb, 'Mode maintenance untuk situs'),
    ('max_file_size_mb', '100'::jsonb, 'Ukuran maksimum file upload dalam MB'),
    ('allowed_file_types', '["mkv", "mp4", "avi", "zip", "rar"]'::jsonb, 'Tipe file yang diizinkan untuk upload'),
    ('posts_per_page', '20'::jsonb, 'Jumlah post per halaman'),
    ('site_title', '"Indo Tosho Mirror"'::jsonb, 'Judul situs'),
    ('site_description', '"Platform berbagi anime dan konten digital"'::jsonb, 'Deskripsi situs')
ON CONFLICT (key) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.settings IS 'Tabel konfigurasi aplikasi dengan format key-value';
COMMENT ON COLUMN public.settings.id IS 'Primary key UUID';
COMMENT ON COLUMN public.settings.key IS 'Kunci pengaturan (unique)';
COMMENT ON COLUMN public.settings.value IS 'Nilai pengaturan dalam format JSON';
COMMENT ON COLUMN public.settings.description IS 'Deskripsi pengaturan';
COMMENT ON COLUMN public.settings.created_at IS 'Waktu pengaturan dibuat';
COMMENT ON COLUMN public.settings.updated_at IS 'Waktu pengaturan terakhir diupdate';