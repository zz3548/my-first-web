"use client";
import React from "react";
import Link from "next/link";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function Hero({
  title = "신지원의 블로그",
  subtitle = "내 일상을 기록하고 공유하는 공간입니다.",
}: Props) {
  return (
    <div className="w-full rounded-lg bg-slate-700 text-white p-8 mb-8 border border-slate-600 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight">{title}</h1>
        <p className="mt-2 text-lg text-slate-200">{subtitle}</p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/posts/new"
            className="inline-block rounded bg-white text-slate-800 px-4 py-2 font-medium"
            aria-label="새 글 작성"
          >
            새 글 작성
          </Link>
          <Link
            href="/posts"
            className="inline-block rounded border border-slate-600 text-white/90 px-4 py-2"
          >
            포스트 목록
          </Link>
        </div>
      </div>
    </div>
  );
}
