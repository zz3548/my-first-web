import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "내 블로그",
  description: "웹 개발을 배우며 기록하는 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
        <nav className="border-b border-slate-200 bg-slate-100/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              내 블로그
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Link
                href="/"
                className="rounded-full px-3 py-2 transition hover:bg-slate-200 hover:text-slate-900"
              >
                홈
              </Link>
              <Link
                href="/posts"
                className="rounded-full px-3 py-2 transition hover:bg-slate-200 hover:text-slate-900"
              >
                블로그
              </Link>
              <Link
                href="/posts/new"
                className="rounded-full px-3 py-2 transition hover:bg-slate-200 hover:text-slate-900"
              >
                새 글 쓰기
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-slate-50 py-4 text-center text-sm text-slate-500">
          © 2026 내 블로그
        </footer>
      </body>
    </html>
  );
}
