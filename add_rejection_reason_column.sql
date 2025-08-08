-- Script untuk menambahkan kolom rejection_reason ke tabel posts
-- Jalankan script ini di Supabase SQL Editor atau database console

-- Tambahkan kolom rejection_reason ke tabel posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Tambahkan komentar untuk dokumentasi
COMMENT ON COLUMN posts.rejection_reason IS 'Alasan penolakan postingan oleh admin';

-- Verifikasi kolom sudah ditambahkan
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'rejection_reason';