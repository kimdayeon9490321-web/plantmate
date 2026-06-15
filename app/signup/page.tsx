'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/providers';
import Shell from '@/components/Shell';

export default function SignupPage() {
  const supabase = useSupabase();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // 아이디를 가짜 이메일로 변환
    const fakeEmail = `${username}@plantmate.app`;

    const { data, error } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        data: {
          display_name: nickname
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert([{ user_id: data.user.id, display_name: nickname }]);
    }

    setLoading(false);
    router.push('/mypage');
  };

  return (
    <Shell>
      <div className="mx-auto max-w-2xl space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">회원가입</h1>
          <p className="mt-2 text-slate-600">PlantMate 가입 후 성장일지와 커뮤니티를 이용하세요.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">아이디</span>
            <input
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="영문, 숫자 조합"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">닉네임</span>
            <input
              type="text"
              required
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
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
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          이미 계정이 있나요?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-900">
            로그인
          </Link>
        </p>
      </div>
    </Shell>
  );
}