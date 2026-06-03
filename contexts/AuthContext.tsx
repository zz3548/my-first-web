"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import {
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  signOut as authSignOut,
} from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithEmail: typeof authSignInWithEmail;
  signUpWithEmail: typeof authSignUpWithEmail;
  signOut: typeof authSignOut;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) 빠르게 현재 세션 확인 (getSession은 비교적 덜 경합함)
    (async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(sessionRes.data?.session?.user ?? null);
      } catch (e) {
        // 로그는 남기되 치명적이지 않으므로 무시
        console.debug("auth.getSession error (ignored):", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // 2) 이후 auth 상태 변화 구독 (로그인/로그아웃 자동 반영)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    const subscription = data?.subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signInWithEmail: authSignInWithEmail,
    signUpWithEmail: authSignUpWithEmail,
    signOut: authSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
