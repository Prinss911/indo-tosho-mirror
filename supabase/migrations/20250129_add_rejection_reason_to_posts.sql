-- Add rejection_reason column to posts table
-- This migration adds a column to store the reason when a post is rejected by admin

ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comment to track this change
COMMENT ON COLUMN posts.rejection_reason IS 'Reason provided by admin when rejecting a post';