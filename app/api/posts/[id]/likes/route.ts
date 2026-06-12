import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(_req: NextRequest, context: Context) {
  const cookieStore = await cookies();
  try {
    console.log(
      "[likes POST] incoming Cookie header:",
      _req.headers.get("cookie"),
    );
  } catch (e) {
    console.log("[likes POST] could not read headers", e);
  }
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

  console.log("[likes POST] authError:", authError, "user id:", user?.id);

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const params = await context.params;
  const postId = params.id;

  console.log(`[likes POST] postId=${postId} user=${user.id}`);

  // check existing like
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .limit(1);

  // Ensure profile exists for this user (some signUp flows may skip profile creation)
  try {
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .limit(1);
    if (!prof || (Array.isArray(prof) && prof.length === 0)) {
      console.log("[likes POST] creating missing profile for user", user.id);
      const username = user.email
        ? (user.email.split("@")[0] as string)
        : "user";
      const { error: pErr } = await supabase
        .from("profiles")
        .insert([
          { id: user.id, username, created_at: new Date().toISOString() },
        ]);
      if (pErr)
        console.warn(
          "[likes POST] profile insert warning:",
          pErr.message || pErr,
        );
    }
  } catch (e) {
    console.warn("[likes POST] profile existence check failed:", e);
  }

  if (existing && existing.length > 0) {
    // unlike
    console.log("[likes POST] existing like found, deleting", existing);
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) {
      console.error("[likes POST] delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } else {
    // like
    console.log("[likes POST] inserting like for user", user.id);
    const { error } = await supabase
      .from("likes")
      .insert([{ post_id: postId, user_id: user.id }]);
    if (error) {
      console.error("[likes POST] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // return current count and whether liked
  const { data: countData, error: countErr } = await supabase
    .from("likes")
    .select("id", { count: "exact" })
    .eq("post_id", postId);
  if (countErr)
    return NextResponse.json({ error: countErr.message }, { status: 400 });

  const { data: check } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .limit(1);

  return NextResponse.json({
    liked: Array.isArray(check) && check.length > 0,
    count: (countData as any)?._count?.id ?? (countData ? countData.length : 0),
  });
}

export async function GET(_req: NextRequest, context: Context) {
  const cookieStore = await cookies();
  try {
    console.log(
      "[likes GET] incoming Cookie header:",
      _req.headers.get("cookie"),
    );
  } catch (e) {
    console.log("[likes GET] could not read headers", e);
  }
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

  const { data: countData, error: countErr } = await supabase
    .from("likes")
    .select("id", { count: "exact" })
    .eq("post_id", postId);
  if (countErr)
    return NextResponse.json({ error: countErr.message }, { status: 400 });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[likes GET] user id:", user?.id);

  let liked = false;
  if (user) {
    const { data: check } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .limit(1);
    liked = Array.isArray(check) && check.length > 0;
  }

  return NextResponse.json({
    liked,
    count: (countData as any)?._count?.id ?? (countData ? countData.length : 0),
  });
}
