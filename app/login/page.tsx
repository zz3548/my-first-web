"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-message";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email || !password)
      return setError("이메일과 비밀번호를 모두 입력하세요.");

    try {
      setLoading(true);
      const res = await signInWithEmail(email, password);
      setLoading(false);

      if (res.error) {
        console.error("login error:", res.error);
        setError(getErrorMessage(res.error));
        return;
      }

      // 로그인 성공
      router.push("/posts");
    } catch (err: any) {
      setLoading(false);
      console.error("login exception:", err);
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="text-sm text-slate-500">
        이메일과 비밀번호로 로그인합니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-600">
          아직 계정이 없으신가요?{" "}
          <a
            href="/signup"
            className="font-medium text-slate-900 hover:underline"
          >
            회원가입
          </a>
        </p>
      </div>
    </section>
  );
}
