-- Complete Database Schema for Indo Tosho Mirror
-- Description: Schema lengkap untuk semua 6 tabel utama aplikasi
-- Created: 2025-01-30
-- Note: File ini untuk dokumentasi dan referensi, bukan untuk eksekusi langsung

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT NOT NULL CHECK (length(username) >= 1),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text, 'banned'::text])),
    avatar_url TEXT,
    bio TEXT,
    full_name TEXT,
    website TEXT,
    posts_count INTEGER DEFAULT 0 CHECK (posts_count >= 0),
    animes_count INTEGER DEFAULT 0 CHECK (animes_count >= 0),
    likes_received INTEGER DEFAULT 0 CHECK (likes_received >= 0),
    comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
    bookmarks_count INTEGER DEFAULT 0 CHECK (bookmarks_count >= 0),
    unread_notifications_count INTEGER DEFAULT 0 CHECK (unread_notifications_count >= 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    email TEXT
);

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_english TEXT,
    release_file_name TEXT NOT NULL,
    download_links JSONB NOT NULL,
    subtitle_type TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    mal_id INTEGER,
    episodes INTEGER,
    year INTEGER,
    rating NUMERIC,
    status TEXT,
    cover TEXT,
    description TEXT,
    genres TEXT[],
    submitter_id UUID REFERENCES public.profiles(id),
    submitter_name TEXT,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    rejection_reason TEXT
);

-- =====================================================
-- 4. ADMIN_NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. PROFILES_OPERATION_LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles_operation_log (
    id BIGSERIAL PRIMARY KEY,
    operation_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    operation_data JSONB DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_submitter_id ON public.posts(submitter_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_approved ON public.posts(is_approved);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_mal_id ON public.posts(mal_id);

-- Admin notifications indexes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);

-- Profiles operation log indexes
CREATE INDEX IF NOT EXISTS idx_profiles_operation_log_user_id ON public.profiles_operation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_operation_log_operation_type ON public.profiles_operation_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_profiles_operation_log_created_at ON public.profiles_operation_log(created_at DESC);

-- Settings indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON public.settings(updated_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_operation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

-- Table comments
COMMENT ON TABLE public.profiles IS 'Profil pengguna dengan statistik dan metadata';
COMMENT ON TABLE public.categories IS 'Kategori hierarkis untuk posts';
COMMENT ON TABLE public.posts IS 'Post utama berisi data anime dan konten';
COMMENT ON TABLE public.admin_notifications IS 'Notifikasi untuk admin';
COMMENT ON TABLE public.profiles_operation_log IS 'Log operasi dan aktivitas pengguna';
COMMENT ON TABLE public.settings IS 'Konfigurasi aplikasi dalam format key-value';

-- =====================================================
-- SAMPLE RLS POLICIES (Reference)
-- =====================================================

/*
-- Example RLS policies (uncomment and modify as needed)

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can view approved posts" ON public.posts
    FOR SELECT USING (is_approved = true);

-- Admin notifications policies
CREATE POLICY "Only admins can view notifications" ON public.admin_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Settings policies
CREATE POLICY "Only admins can manage settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
*/