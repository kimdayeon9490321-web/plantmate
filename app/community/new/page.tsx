import Shell from '@/components/Shell';
import CommunityNewForm from '@/components/CommunityNewForm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function CommunityNewPage() {
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

  const { data: plants, error } = await supabase.from('plants').select('id, name').order('name');

  if (error) {
    return (
      <Shell>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
          <p>식물 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">새 게시글 작성</h1>
            <p className="mt-2 text-slate-600">같은 식물을 키우는 사용자들과 경험을 공유해보세요.</p>
          </div>
        </section>

        <CommunityNewForm plants={plants ?? []} />
      </div>
    </Shell>
  );
}
