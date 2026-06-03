import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  // 환경변수 로깅 (디버깅용)
  console.log(
    "[GET /api/posts] URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + "...",
  );
  console.log(
    "[GET /api/posts] KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 30) + "...",
  );

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "환경변수가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, image_url, created_at, user_id")
      .order("created_at", { ascending: false });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err: any) {
    // Possible missing column (image_url) — retry without it
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, created_at, user_id")
        .order("created_at", { ascending: false });
      if (error)
        return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data);
    } catch (err2: any) {
      return NextResponse.json({ error: String(err2) }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // 로그: 원본 쿠키 헤더(브라우저에서 쿠키가 전송되는지 확인)
  try {
    console.log(
      "[POST /api/posts] request cookie header:",
      request.headers.get("cookie"),
    );
  } catch (e) {
    console.warn("[POST /api/posts] failed to read request.headers.cookie", e);
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "환경변수가 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  // 먼저 쿠키 기반 클라이언트로 인증 사용자 확인
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // 로그: cookieStore에 저장된 주요 토큰 확인
  try {
    const sbToken = cookieStore.get("sb:token")?.value;
    const sbAccess = cookieStore.get("sb-access-token")?.value;
    console.log(
      "[POST /api/posts] cookieStore tokens: sb:token=",
      sbToken ? "(present)" : "(missing)",
      "sb-access-token=",
      sbAccess ? "(present)" : "(missing)",
    );
  } catch (e) {
    console.warn("[POST /api/posts] failed to inspect cookieStore", e);
  }

  // 현재 인증 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // 추가 로그: supabase 세션 정보 확인
  try {
    const sess = await supabase.auth.getSession();
    console.log("[POST /api/posts] getSession result:", sess);
  } catch (e) {
    console.warn("[POST /api/posts] getSession failed:", e);
  }

  console.log("[POST /api/posts] authError:", authError, "user id:", user?.id);

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  if (!body || !body.title) {
    return NextResponse.json({ error: "title이 필요합니다" }, { status: 400 });
  }

  // 서버 세션 클라이언트로 프로필 업서트 및 포스트 삽입
  // (RLS가 user_id = auth.uid()를 요구하므로, 서버에서 명시적으로 user_id를 설정하면 허용됩니다)
  const { error: profileUpsertError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username: user.email?.split("@")[0] || "user",
      created_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileUpsertError) {
    console.warn("[POST /api/posts] Profile upsert error:", profileUpsertError);
  }

  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        title: String(body.title).trim(),
        content: body.content ? String(body.content).trim() : "",
        image_url: body.image_url ?? null,
        user_id: user.id,
      },
    ])
    .select("id, title, content, created_at, user_id")
    .single();

  if (error) {
    console.error("[POST /api/posts] Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
