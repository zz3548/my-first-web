-- Migration: Add Row Level Security (RLS) policies for `posts` table
-- Generated from supabase/policies/posts_rls.sql
-- Apply with Supabase CLI migration workflow (e.g. `supabase db push` / `supabase migration apply`).

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
-- Ensure idempotency: drop existing policies with the same names if present
DROP POLICY IF EXISTS "select_public_posts" ON public.posts;
CREATE POLICY "select_public_posts" ON public.posts
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "insert_own_post" ON public.posts;
CREATE POLICY "insert_own_post" ON public.posts
  FOR INSERT
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_post" ON public.posts;
CREATE POLICY "update_own_post" ON public.posts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_post" ON public.posts;
CREATE POLICY "delete_own_post" ON public.posts
  FOR DELETE
  USING (user_id = auth.uid());

-- Note: server-side requests with the `service_role` key bypass RLS.
