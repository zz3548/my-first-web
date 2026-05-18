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

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, user_id")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();

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

  // 현재 인증 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[POST /api/posts] authError:", authError, "user id:", user?.id);

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  if (!body || !body.title) {
    return NextResponse.json({ error: "title이 필요합니다" }, { status: 400 });
  }

  // 서비스 역할 클라이언트로 RLS 우회하여 삽입
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[POST /api/posts] SUPABASE_SERVICE_ROLE_KEY 없음");
    return NextResponse.json(
      {
        error:
          "서버 설정 오류. .env.local에 SUPABASE_SERVICE_ROLE_KEY를 추가하세요.",
      },
      { status: 500 },
    );
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  // 프로필이 없으면 자동 생성 (upsert 사용)
  const { error: profileUpsertError } = await adminSupabase
    .from("profiles")
    .upsert(
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

  const { data, error } = await adminSupabase
    .from("posts")
    .insert([
      {
        title: String(body.title).trim(),
        content: body.content ? String(body.content).trim() : "",
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
