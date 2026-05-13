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
 * 반환값은 Supabase의 응답을 그대로 전달합니다. 에러는 호출자가 처리하세요.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string,
) {
  const res = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
    },
  });

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
