"use client";

import { useState } from "react";

type Props = {
  onSearch?: (term: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  onSearch,
  placeholder = "검색어를 입력하세요",
}: Props) {
  const [term, setTerm] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTerm(v);
    onSearch?.(v);
  };

  return (
    <div className="mb-4">
      <input
        value={term}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        aria-label="검색"
      />
    </div>
  );
}
