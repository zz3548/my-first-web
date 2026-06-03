-- Migration: Add image_url column to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS image_url text;

-- No RLS changes required; storing image URLs (public) only.
