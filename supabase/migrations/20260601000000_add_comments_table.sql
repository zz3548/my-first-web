-- Migration: Add comments table with RLS
-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow public select (comments visible to all)
DROP POLICY IF EXISTS "select_public_comments" ON public.comments;
CREATE POLICY "select_public_comments" ON public.comments
  FOR SELECT
  USING (true);

-- Allow users to insert their own comments
DROP POLICY IF EXISTS "insert_own_comment" ON public.comments;
CREATE POLICY "insert_own_comment" ON public.comments
  FOR INSERT
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- Allow users to update their own comments
DROP POLICY IF EXISTS "update_own_comment" ON public.comments;
CREATE POLICY "update_own_comment" ON public.comments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own comments
DROP POLICY IF EXISTS "delete_own_comment" ON public.comments;
CREATE POLICY "delete_own_comment" ON public.comments
  FOR DELETE
  USING (user_id = auth.uid());

-- Note: server-side requests with the `service_role` key bypass RLS.
