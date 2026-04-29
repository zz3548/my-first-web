"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return alert("이메일을 입력하세요");

    // TODO: Supabase Auth 연동 예정
    try {
      // 임시 동작: 로컬스토리지에 저장 후 마이페이지로 이동
      localStorage.setItem("mockUserEmail", email);
      alert("로그인(모의) 성공");
      router.push("/mypage");
    } catch (err) {
      console.error(err);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="text-sm text-slate-500">
        이메일로 로그인합니다 (개발용 모의 동작)
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

        <button className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          로그인 (모의)
        </button>
      </form>
    </section>
  );
}
