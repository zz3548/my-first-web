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

type Post = {
  id: string;
  title: string;
  created_at: string;
};

type Profile = {
  username: string | null;
  avatar_url: string | null;
};

export default async function MyPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Use read-only cookie accessor here. Mutations must run in server actions/routes.
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      } as any,
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let posts: Post[] = [];
  let error: string | null = null;

  if (user) {
    try {
      const { data: profData } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      profile = profData || null;

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (postError) error = postError.message;
      else posts = postData || [];
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">마이페이지</h1>
          <p className="text-sm text-slate-600">
            로그인한 사용자의 개인 공간입니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/posts/new">새 글 작성</Link>
        </Button>
      </div>

      {!user && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <p>로그인이 필요합니다. 로그인 후 다시 시도하세요.</p>
        </div>
      )}

      {user && (
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-slate-200" />
            )}
            <div>
              <p className="font-medium">{profile?.username ?? user.email}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">작성한 글</h2>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 mt-3">
                <p>오류: {error}</p>
              </div>
            )}

            {posts.length === 0 && !error && (
              <div className="mt-3 text-sm text-slate-600">
                작성한 글이 없습니다.
              </div>
            )}

            {posts.length > 0 && (
              <div className="grid grid-cols-1 gap-3 mt-3">
                {posts.map((p) => (
                  <Link key={p.id} href={`/posts/${p.id}`}>
                    <Card className="hover:shadow">
                      <CardHeader>
                        <CardTitle>{p.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(p.created_at).toLocaleDateString("ko-KR")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent />
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
