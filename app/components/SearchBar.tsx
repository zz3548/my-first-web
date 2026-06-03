"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Props = {
  initialValue?: string;
  placeholder?: string;
};

export default function SearchBar({
  initialValue = "",
  placeholder = "검색어를 입력하세요",
}: Props) {
  const [term, setTerm] = useState(initialValue);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    // keep in sync if external navigation changed search param
    const q = searchParams?.get("q") || "";
    setTerm(q);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTerm(v);
    if (timer) window.clearTimeout(timer);
    const id = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (v) params.set("q", v);
      else params.delete("q");
      const qstr = params.toString();
      // use replace to avoid excessive history entries
      router.replace(qstr ? `${pathname}?${qstr}` : pathname);
      // debug log
      // eslint-disable-next-line no-console
      console.log(
        "SearchBar: navigating to",
        qstr ? `${pathname}?${qstr}` : pathname,
      );
    }, 300);
    setTimer(id);
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
