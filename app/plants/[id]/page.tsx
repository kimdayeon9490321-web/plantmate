import Link from 'next/link';
import Shell from '@/components/Shell';
import RegisterPlantButton from '@/components/RegisterPlantButton';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface PlantPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlantDetailPage({ params }: PlantPageProps) {
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

  const [{ data: plant, error: plantError }, sessionResult] = await Promise.all([
    supabase
      .from('plants')
      .select('id, name, category, summary, description')
      .eq('id', id)
      .single(),
    supabase.auth.getSession()
  ]);

  const session = sessionResult.data.session;
  let isRegistered = false;

  if (session) {
    const { data: userPlant } = await supabase
      .from('user_plants')
      .select('id')
      .eq('plant_id', id)
      .eq('user_id', session.user.id)
      .maybeSingle();

    isRegistered = Boolean(userPlant?.id);
  }

 if (plantError || !plant) {
  return (
    <Shell>
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
        <h1 className="text-2xl font-semibold">식물을 찾을 수 없습니다.</h1>
        <p className="mt-2">등록된 식물 데이터가 없거나 요청이 잘못되었습니다.</p>
        <Link href="/plants" className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          식물 목록으로 돌아가기
        </Link>
      </div>
    </Shell>
  );
}

  return (
    <Shell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">식물 도감</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">{plant.name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-brand-700">{plant.category ?? '기타'}</span>
              </div>
              <p className="mt-4 max-w-2xl text-slate-600">{plant.summary}</p>
            </div>
            <Link href="/plants" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              식물 목록으로 돌아가기
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">요약 정보</h2>
          <p className="mt-4 text-slate-600">{plant.summary}</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">상세 설명</h2>
          <p className="mt-4 whitespace-pre-line text-slate-600">{plant.description}</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">내 식물 등록</h2>
          <p className="mt-3 text-slate-600">로그인한 사용자만 이 식물을 내 식물로 등록할 수 있습니다.</p>
          <div className="mt-6">
            <RegisterPlantButton plantId={plant.id} plantName={plant.name} alreadyRegistered={isRegistered} />
          </div>
        </section>
      </div>
    </Shell>
  );
}
