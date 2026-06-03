import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import SearchBar from "@/app/components/SearchBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";

type Post = {
  id: string;
  title: string;
  content: string | null;
  image_url?: string | null;
  created_at: string;
};

export default async function Home() {
  let posts: Post[] = [];

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        },
      },
    );

    try {
      const { data } = await supabase
        .from("posts")
        .select("id, title, content, image_url, created_at")
        .order("created_at", { ascending: false })
        .limit(12);
      posts = data || [];
    } catch (err) {
      try {
        const { data } = await supabase
          .from("posts")
          .select("id, title, content, created_at")
          .order("created_at", { ascending: false })
          .limit(12);
        posts = data || [];
      } catch (err2) {
        posts = [];
      }
    }
  } catch (e) {
    posts = [];
  }

  const featured = posts.slice(0, 3);
  const rest = posts.slice(3);

  return (
    <main className="container mx-auto p-6">
      <div className="space-y-6">
        <Hero image={featured[0]?.image_url ?? null} />

        <div className="md:grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold">추천 글</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featured.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>

            <h3 className="text-xl font-medium mt-6">최신 글</h3>
            <div className="space-y-4 mt-2">
              {rest.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
