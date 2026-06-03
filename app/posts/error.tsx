"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // 개발자용 로그는 콘솔에 남깁니다.
    console.error("Route error (posts):", error);
  }, [error]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>

      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
        <p>죄송합니다. 게시글을 불러오는 중에 문제가 발생했습니다.</p>
        <p className="mt-2 text-sm text-red-700">잠시 후 다시 시도해 주세요.</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          onClick={() => reset()}
        >
          다시 시도
        </button>

        <Link
          href="/posts"
          className="inline-flex items-center rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          목록으로 돌아가기
        </Link>
      </div>
    </section>
  );
}
