import React from "react";

export default function PostLoading() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse" />
        <div className="h-48 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
