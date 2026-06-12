// Supabase 인증 래퍼 함수 모음
// - 로그인: signInWithEmail(email, password)
// - 회원가입: signUpWithEmail(email, password, name)
// - 로그아웃: signOut()

import supabase from "./supabase/client";
import type { AuthResponse, Session, User } from "@supabase/supabase-js";

/**
 * 이메일/비밀번호로 로그인합니다.
 * 반환값은 Supabase의 응답을 그대로 전달합니다. 에러는 호출자가 처리하세요.
 */
export async function signInWithEmail(email: string, password: string) {
  const res = await supabase.auth.signInWithPassword({ email, password });
  return res; // { data, error }
}

/**
 * 이메일/비밀번호로 회원가입합니다. 이름(name)은 user metadata에 저장합니다.
 * 프로필도 profiles 테이블에 자동 생성됩니다.
 * 반환값은 Supabase의 응답을 그대로 전달합니다. 에러는 호출자가 처리하세요.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string,
) {
  // 레이트 리밋 등 일시적 실패를 대비한 지수 백오프 재시도
  const maxAttempts = 3;
  let res: any = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name } : undefined,
      },
    });

    if (!res.error) break; // 성공

    const msg = String(
      res.error?.message || res.error?.error || "",
    ).toLowerCase();
    const isRateLimit =
      msg.includes("rate limit") ||
      msg.includes("email rate limit") ||
      msg.includes("rate_limit");

    if (isRateLimit && attempt < maxAttempts) {
      const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      console.info(
        `signUp attempt ${attempt} failed due to rate limit; retrying after ${delay}ms`,
      );
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    // 재시도 불가 또는 마지막 시도에서 실패한 경우 루프 탈출
    break;
  }

  // 회원가입 성공 시 profiles 테이블에 사용자 프로필 생성
  if (res.data?.user?.id) {
    // signUp 결과에 세션이 포함되지 않는(이메일 확인이 필요한) 경우
    // anon 클라이언트로는 RLS 때문에 profiles INSERT가 실패할 수 있습니다.
    // 세션이 있을 때만 즉시 생성하고, 세션이 없으면 생성을 건너뜁니다.
    if (res.data.session) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: res.data.user.id,
            username: name || email.split("@")[0],
          },
        ])
        .single();

      if (profileError) {
        console.error(
          "Failed to create profile:",
          JSON.stringify(profileError),
        );
        // 프로필 생성 실패해도 auth는 성공했으므로, 에러만 로그하고 계속 진행
      }
    } else {
      console.info(
        "Profile creation skipped: no active session after signUp. Create profile later on first login or via server-side job.",
      );
    }
  }

  return res; // { data, error }
}

/**
 * 로그아웃합니다.
 * 반환값은 Supabase의 응답을 그대로 전달합니다. 에러는 호출자가 처리하세요.
 */
export async function signOut() {
  const res = await supabase.auth.signOut();
  return res; // { error }
}

export default {
  signInWithEmail,
  signUpWithEmail,
  signOut,
};
