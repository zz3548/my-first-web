import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Context = {
  params:
    | Promise<{ id: string; commentId: string }>
    | { id: string; commentId: string };
};

export async function POST(_req: NextRequest, context: Context) {
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
      },
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

  console.log(`[comment-likes POST] commentId=${commentId} user=${user.id}`);

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log("[comment-likes POST] existing like found, deleting", existing);
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", user.id);
    if (error) {
      console.error("[comment-likes POST] delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } else {
    console.log("[comment-likes POST] inserting like for user", user.id);
    const { error } = await supabase
      .from("likes")
      .insert([{ comment_id: commentId, user_id: user.id }]);
    if (error) {
      console.error("[comment-likes POST] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  const { data: countData, error: countErr } = await supabase
    .from("likes")
    .select("id", { count: "exact" })
    .eq("comment_id", commentId);
  if (countErr)
    return NextResponse.json({ error: countErr.message }, { status: 400 });

  const { data: check } = await supabase
    .from("likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .limit(1);

  return NextResponse.json({
    liked: Array.isArray(check) && check.length > 0,
    count: countData?._count?.id ?? (countData ? countData.length : 0),
  });
}

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
      },
    },
  );

  const params = await context.params;
  const commentId = params.commentId;

  const { data: countData, error: countErr } = await supabase
    .from("likes")
    .select("id", { count: "exact" })
    .eq("comment_id", commentId);
  if (countErr)
    return NextResponse.json({ error: countErr.message }, { status: 400 });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let liked = false;
  if (user) {
    const { data: check } = await supabase
      .from("likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .limit(1);
    liked = Array.isArray(check) && check.length > 0;
  }

  return NextResponse.json({
    liked,
    count: countData?._count?.id ?? (countData ? countData.length : 0),
  });
}
