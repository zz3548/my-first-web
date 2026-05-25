-- Add Row Level Security (RLS) policies for `profiles` table
-- Allows authenticated users to create and manage their own profile rows

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT of profiles (optional)
CREATE POLICY "select_public_profiles" ON public.profiles
  FOR SELECT
  USING (true);

-- Allow authenticated users to INSERT a profile where auth.uid() equals the inserted id
CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "delete_own_profile" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);
