-- Remove file_size and file_size_unit columns from posts table
-- This migration removes the deprecated size-related columns that were causing deployment errors

ALTER TABLE posts DROP COLUMN IF EXISTS file_size;
ALTER TABLE posts DROP COLUMN IF EXISTS file_size_unit;

-- Add comment to track this change
COMMENT ON TABLE posts IS 'Posts table - file_size and file_size_unit columns removed on 2025-01-28';
