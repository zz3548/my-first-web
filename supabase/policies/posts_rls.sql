-- posts table RLS policies for "own only" access
-- Run this in Supabase SQL editor (or psql connected to your DB)

-- Ensure RLS is enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT (optional)
CREATE POLICY "Select posts" ON public.posts
  FOR SELECT
  USING (true);

-- Allow authenticated users to INSERT only when auth.uid() = user_id
CREATE POLICY "Insert own posts" ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Update own posts" ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Delete own posts" ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Helpful: revoke broad grants if present (optional)
-- REVOKE ALL ON public.posts FROM PUBLIC;

-- Note: After applying, client requests must include the Supabase auth cookie or JWT so
-- auth.uid() is set. Server-side admin (service_role) requests bypass RLS.
