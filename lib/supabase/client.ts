// Browser Supabase client for Next.js App Router
// Uses createBrowserClient from @supabase/ssr (avoid direct createClient usage)

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set",
  );
}

const supabase: SupabaseClient = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
);

export default supabase;
