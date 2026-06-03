"use client";

import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground mb-4">
          문제가 발생하여 페이지를 표시할 수 없습니다.
        </p>
        <details className="text-xs mb-4 text-red-600">
          <summary className="cursor-pointer">오류 자세히 보기</summary>
          <pre className="whitespace-pre-wrap">
            {String(error?.message || error)}
          </pre>
        </details>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => reset()}
          >
            재시도
          </button>
        </div>
      </div>
    </div>
  );
}
