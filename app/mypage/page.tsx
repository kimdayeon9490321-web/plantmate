import Shell from '@/components/Shell';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, bio')
    .eq('user_id', session.user.id)
    .single();

  return (
    <Shell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">마이페이지</h1>
          <p className="mt-2 text-slate-600">계정 정보와 내 식물을 한 곳에서 관리하세요.</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">내 정보</h2>
            <p className="mt-3 text-slate-600">닉네임: {profile?.display_name ?? '사용자'}</p>
            <p className="mt-1 text-slate-600">이메일: {session.user.email}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">설정</h2>
            <p className="mt-3 text-slate-600">프로필 정보, 알림, 공개 범위를 관리할 수 있습니다.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">활동 내역</h2>
            <p className="mt-3 text-slate-600">최근 작성한 성장일지, 댓글, 커뮤니티 활동을 확인할 수 있습니다.</p>
          </div>
        </section>
      </div>
    </Shell>
  );
}
