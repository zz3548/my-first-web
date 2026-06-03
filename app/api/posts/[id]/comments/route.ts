import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_req: NextRequest, context: Context) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options?: any) =>
          cookieStore.set(name, value, options),
        remove: (name: string, options?: any) => cookieStore.delete(name),
      } as any,
    },
  );

  const params = await context.params;
  const postId = params.id;

  const { data, error } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id, profiles(username, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function POST(request: NextRequest, context: Context) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options?: any) =>
          cookieStore.set(name, value, options),
        remove: (name: string, options?: any) => cookieStore.delete(name),
      } as any,
    },
  );

  // 인증된 사용자만 댓글 작성 가능
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const params = await context.params;
  const postId = params.id;

  if (!body || !body.content || typeof body.content !== "string") {
    return NextResponse.json(
      { error: "content가 필요합니다" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        post_id: postId,
        user_id: user.id,
        content: String(body.content).trim(),
      },
    ])
    .select("id, content, created_at, user_id");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data?.[0] || null, { status: 201 });
}
