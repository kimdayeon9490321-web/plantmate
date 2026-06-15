'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/app/providers';
import Shell from '@/components/Shell';

export default function LoginPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectedFrom') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // 아이디를 가짜 이메일로 변환
    const fakeEmail = `${username}@plantmate.app`;

    const { error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password
    });

    setLoading(false);
    if (error) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    router.push(redirectTo);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-2xl space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">로그인</h1>
          <p className="mt-2 text-slate-600">PlantMate에 로그인하여 나만의 식물 관리를 시작하세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">아이디</span>
            <input
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">비밀번호</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-semibold text-brand-700 hover:text-brand-900">
            회원가입
          </Link>
        </p>
      </div>
    </Shell>
  );
}