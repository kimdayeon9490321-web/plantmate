import Link from 'next/link';
import Shell from '@/components/Shell';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MyPlantsPage() {
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

  const { data: myPlants, error } = await supabase
    .from('user_plants')
    .select('id, nickname, created_at, plants(id, name)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <Shell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">내 식물 목록</h1>
              <p className="mt-2 text-slate-600">등록한 식물을 확인하고 성장일지를 관리하세요.</p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
            <p>내 식물 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.</p>
          </div>
        ) : myPlants?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myPlants.map((plant: any) => (
              <Link
                key={plant.id}
                href={`/my-plants/${plant.id}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">{plant.plants?.name ?? '알 수 없는 식물'}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    내 식물
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-600">별명: {plant.nickname ?? '등록된 닉네임 없음'}</p>
                <p className="mt-3 text-sm text-slate-500">등록일: {new Date(plant.created_at).toLocaleDateString('ko-KR')}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">등록된 식물이 없습니다.</h2>
            <p className="mt-3 text-slate-600">식물 상세 페이지에서 먼저 내 식물을 등록해보세요.</p>
            <Link href="/plants" className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              식물 목록으로 이동하기
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}
