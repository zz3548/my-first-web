"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import supabase from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 미인증 사용자 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!user) {
      setError("로그인이 필요합니다");
      return;
    }

    if (title.trim() === "") {
      setError("제목을 입력하세요");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const resultErr = await res.json();
        setError(`저장 실패: ${resultErr.error || "알 수 없는 오류"}`);
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();

      // 성공하면 새 글 상세 또는 목록으로 이동
      if (data?.id) {
        router.push(`/posts/${data.id}`);
      } else {
        router.push("/posts");
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "저장 중 알 수 없는 오류가 발생했습니다",
      );
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
          <p>로딩 중...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <p>로그인이 필요합니다. 로그인 페이지로 이동 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">새 게시글 작성</h1>
        <p className="text-sm text-slate-500">
          제목과 내용을 입력한 뒤 저장 버튼을 눌러주세요.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            제목
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="content"
            className="text-sm font-medium text-slate-700"
          >
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="내용을 입력하세요"
            rows={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </form>
    </section>
  );
}
