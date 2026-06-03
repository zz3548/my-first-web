import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Context = {
  params:
    | Promise<{ id: string; commentId: string }>
    | { id: string; commentId: string };
};

export async function PUT(request: NextRequest, context: Context) {
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const params = await context.params;
  const commentId = params.commentId;
  const body = await request.json().catch(() => ({}));

  if (!body || typeof body.content !== "string" || body.content.trim() === "") {
    return NextResponse.json(
      { error: "content가 필요합니다" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ content: String(body.content).trim() })
    .eq("id", commentId)
    .select("id, content, created_at, user_id");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data?.[0] || null);
}

export async function DELETE(_req: NextRequest, context: Context) {
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const params = await context.params;
  const commentId = params.commentId;

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true }, { status: 200 });
}
