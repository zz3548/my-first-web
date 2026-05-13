import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // cookie helpers for @supabase/ssr
      cookies: {
        get: (name: string) => {
          const c = req.cookies.get(name);
          return c ? c.value : undefined;
        },
        set: (name: string, value: string, options?: any) => {
          // NextResponse.cookies.set accepts (name, value, options)
          res.cookies.set(name, value, options);
        },
        remove: (name: string, options?: any) => {
          // NextResponse.cookies.delete accepts a single argument (name or options object)
          // pass only the cookie name to delete
          res.cookies.delete(name);
        },
      },
    },
  );

  // check current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // protect /posts/new and /mypage and its subpaths
  const isProtected =
    pathname === "/posts/new" || pathname.startsWith("/mypage");

  if (isProtected && !user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/posts/new", "/mypage/:path*"],
};
