-- Migration: Add likes table for posts and comments
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id uuid NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Prevent duplicate likes per (user, post) or (user, comment)
CREATE UNIQUE INDEX IF NOT EXISTS unique_like_per_post ON public.likes (user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_like_per_comment ON public.likes (user_id, comment_id) WHERE comment_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select likes (counts)
DROP POLICY IF EXISTS "select_public_likes" ON public.likes;
CREATE POLICY "select_public_likes" ON public.likes
  FOR SELECT
  USING (true);

-- Allow users to insert their own likes
DROP POLICY IF EXISTS "insert_own_like" ON public.likes;
CREATE POLICY "insert_own_like" ON public.likes
  FOR INSERT
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- Allow users to delete their own likes
DROP POLICY IF EXISTS "delete_own_like" ON public.likes;
CREATE POLICY "delete_own_like" ON public.likes
  FOR DELETE
  USING (user_id = auth.uid());

-- Note: service_role bypasses RLS
