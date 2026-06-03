import React from "react";

export default function Loading() {
  return (
    <div className="min-h-32 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-pulse text-lg">로딩 중…</div>
      </div>
    </div>
  );
}
