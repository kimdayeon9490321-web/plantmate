import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return req.cookies.getAll();
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res = NextResponse.next({ request: req });
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const protectedRoutes = ['/mypage', '/my-plants'];
  const isProtected = protectedRoutes.some(
    (path) =>
      req.nextUrl.pathname === path ||
      req.nextUrl.pathname.startsWith(`${path}/`)
  );

  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/mypage/:path*', '/my-plants/:path*']
};