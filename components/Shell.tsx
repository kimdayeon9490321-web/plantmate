'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, useSupabaseClient } from '@/app/providers';

const navItems = [
  { href: '/', label: '홈' },
  { href: '/plants', label: '식물도감' },
  { href: '/community', label: '커뮤니티' },
  { href: '/my-plants', label: '내 식물' },
  { href: '/mypage', label: '마이페이지' }
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setDisplayName(null);
      return;
    }

    const loadProfile = async () => {
      const { data } = await supabaseClient
        .from('profiles')
        .select('display_name')
        .eq('user_id', session.user.id)
        .single();

      setDisplayName(data?.display_name ?? null);
    };

    loadProfile();
  }, [session, supabaseClient]);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold text-slate-900">
            PlantMate
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  {displayName ?? session.user.email ?? '회원'}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-expanded={mobileOpen}
            aria-label="메뉴 열기"
            onClick={() => setMobileOpen((state) => !state)}
          >
            <span className="sr-only">모바일 메뉴</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
            <div className="space-y-3 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              {session ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    {displayName ?? session.user.email ?? '회원'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="block rounded-2xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </section>
    </main>
  );
}
