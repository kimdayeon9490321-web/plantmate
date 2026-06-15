import Shell from '@/components/Shell';
import JournalManager from '@/components/JournalManager';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';

interface MyPlantDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MyPlantDetailPage({ params }: MyPlantDetailProps) {
  const { id } = await params;

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

  const { data: myPlant, error } = await supabase
    .from('user_plants')
    .select('id, nickname, created_at, plants(id, name)')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();

  if (error || !myPlant) {
  return (
    <pre>{JSON.stringify({ id, userId: session.user.id, myPlant, error }, null, 2)}</pre>
  );
}

  return (
    <Shell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">내 식물</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">{(myPlant.plants as any)?.name ?? '등록된 식물'}</h1>
              <div className="mt-3 flex flex-wrap gap-2 text-slate-600">
                <span>별명: {myPlant.nickname ?? '없음'}</span>
                <span className="hidden sm:inline">·</span>
                <span>등록일: {new Date(myPlant.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">성장일지</h2>
              <p className="mt-2 text-slate-600">작성한 성장 기록을 확인하고 새로운 일지를 추가하거나 관리할 수 있습니다.</p>
            </div>
          </div>

          <div className="mt-6">
            <JournalManager userPlantId={myPlant.id} />
          </div>
        </section>
      </div>
    </Shell>
  );
}
