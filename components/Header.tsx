"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await signOut();
      if (res.error) {
        alert(res.error.message || "로그아웃에 실패했습니다.");
      } else {
        router.push("/");
      }
    } catch (e) {
      console.error(e);
      alert("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
      <Link
        href="/"
        className="rounded-full px-3 py-2 transition hover:bg-slate-200 hover:text-slate-900"
      >
        홈
      </Link>
      <Link
        href="/posts"
        className="rounded-full px-3 py-2 transition hover:bg-slate-200 hover:text-slate-900"
      >
        블로그
      </Link>

      {loading ? (
        <span className="px-3 py-2 text-sm text-slate-400">로딩...</span>
      ) : user ? (
        <>
          <Link
            href="/posts/new"
            className="rounded-full px-3 py-2 transition hover:bg-slate-200 hover:text-slate-900"
          >
            새 글 쓰기
          </Link>
          <button
            onClick={handleLogout}
            disabled={busy}
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            {busy ? "로그아웃..." : "로그아웃"}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-full px-3 py-2 transition hover:bg-slate-200 hover:text-slate-900"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-full px-3 py-2 transition hover:bg-slate-200 hover:text-slate-900"
          >
            회원가입
          </Link>
        </>
      )}
    </div>
  );
}
