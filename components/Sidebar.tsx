"use client";

import React from "react";
import Link from "next/link";
import SearchBar from "../app/components/SearchBar";

export default function Sidebar() {
  return (
    <aside className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-medium text-slate-900">내 프로필</h4>
        <p className="text-sm text-slate-600 mt-2">
          로그인 사용자 정보 및 빠른 링크
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/posts/new"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            새 글 작성
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-medium text-slate-900">검색</h4>
        <div className="mt-2">
          <SearchBar />
        </div>
      </div>
    </aside>
  );
}
