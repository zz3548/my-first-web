import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type PostRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: PostRouteContext) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options?: any) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options?: any) => {
          cookieStore.delete(name);
        },
      },
    },
  );

  const params = await context.params;
  const id = params.id;

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, user_id")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, context: PostRouteContext) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options?: any) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options?: any) => {
          cookieStore.delete(name);
        },
      },
    },
  );

  // 현재 인증 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const params = await context.params;
  const id = params.id;

  const body = await request.json();
  if (!body || !body.title) {
    return NextResponse.json({ error: "title이 필요합니다" }, { status: 400 });
  }

  // 먼저 현재 post가 존재하고 작성자가 맞는지 확인
  const { data: existingPost, error: fetchError } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existingPost) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // 현재 사용자가 작성자인지 확인 (Ch11 RLS가 없으면 필요)
  if (existingPost.user_id !== user.id) {
    return NextResponse.json(
      { error: "수정 권한이 없습니다" },
      { status: 403 },
    );
  }

  // 글 수정 (조건: id 일치)
  const { data, error } = await supabase
    .from("posts")
    .update({
      title: String(body.title).trim(),
      content: body.content ? String(body.content).trim() : "",
    })
    .eq("id", id)
    .select("id, title, content, created_at, user_id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, context: PostRouteContext) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options?: any) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options?: any) => {
          cookieStore.delete(name);
        },
      },
    },
  );

  // 현재 인증 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const params = await context.params;
  const id = params.id;

  // 먼저 현재 post가 존재하고 작성자가 맞는지 확인
  const { data: existingPost, error: fetchError } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existingPost) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // 현재 사용자가 작성자인지 확인 (Ch11 RLS가 없으면 필요)
  if (existingPost.user_id !== user.id) {
    return NextResponse.json(
      { error: "삭제 권한이 없습니다" },
      { status: 403 },
    );
  }

  // 글 삭제 (조건: id 일치)
  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
