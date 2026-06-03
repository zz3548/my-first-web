import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";

type Post = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  user_id: string;
  image_url?: string | null;
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q || "").trim();
  let posts: Post[] = [];
  let error: string | null = null;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // Read-only cookie accessor in page render.
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        } as any,
      },
    );

    let data: any = null;
    let supabaseError: any = null;
    try {
      let query = supabase
        .from("posts")
        .select("id, title, content, image_url, created_at, user_id")
        .order("created_at", { ascending: false });

      if (q) {
        // filter title OR content case-insensitive (PostgREST ilike with %pattern%)
        // build .or string using % wildcards
        const orStr = `title.ilike.%${q}%,content.ilike.%${q}%`;
        query = query.or(orStr);
      }

      const res = await query;
      data = res.data;
      supabaseError = res.error;
    } catch (err: any) {
      // column may not exist yet (migration not applied) — retry without image_url
      try {
        const res2 = await supabase
          .from("posts")
          .select("id, title, content, created_at, user_id")
          .order("created_at", { ascending: false });
        data = res2.data;
        supabaseError = res2.error;
      } catch (err2) {
        supabaseError = err2;
      }
    }

    if (supabaseError) {
      error = supabaseError.message;
    } else {
      posts = data || [];
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다";
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">블로그</h1>
        <Button asChild>
          <Link href="/posts/new">새 글 작성</Link>
        </Button>
      </div>

      {/* Search is shown in the Sidebar under '내 프로필' */}
      {q && (
        <div className="mb-4">
          <p className="text-sm text-slate-600">검색어: {q}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 mb-6">
          <p>오류: {error}</p>
        </div>
      )}

      {posts.length === 0 && !error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <p>아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!</p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="hidden md:block">
            <Sidebar />
          </aside>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  {post.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.content || "(내용 없음)"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
