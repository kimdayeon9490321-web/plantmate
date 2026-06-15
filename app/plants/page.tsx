import Link from 'next/link';
import Shell from '@/components/Shell';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface PlantsPageProps {
  searchParams?: any;
}

async function getPlants(query: string | undefined) {
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
  const filter = query?.trim() ? `%${query.trim()}%` : undefined;

  const request = supabase.from('plants').select('id, name, category, summary');

  if (filter) {
    return request
      .or(`name.ilike.${filter},category.ilike.${filter},summary.ilike.${filter}`)
      .order('name', { ascending: true });
  }

  return request.order('name', { ascending: true });
}

export default async function PlantsPage({ searchParams }: PlantsPageProps) {
  const q = searchParams?.q ?? '';
  const { data: plants, error } = await getPlants(q);

  return (
    <Shell>
      <div className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">식물 목록</h1>
              <p className="mt-2 text-slate-600">PlantMate에 등록된 식물을 검색하고 정보를 확인하세요.</p>
            </div>
            <form method="get" className="flex w-full items-center gap-2 sm:w-auto">
              <label htmlFor="q" className="sr-only">
                검색
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="식물명, 카테고리, 요약 검색"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none sm:w-80"
              />
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                검색
              </button>
            </form>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
            <p>식물 목록을 불러오는 중 오류가 발생했습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plants?.length ? (
              plants.map((plant) => (
                <Link
                  key={plant.id}
                  href={`/plants/${plant.id}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-brand-700">
                      {plant.category ?? '기타'}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-brand-700">
                      상세보기
                    </span>
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold text-slate-900">{plant.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{plant.summary}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-slate-600">검색 결과가 없습니다. 다른 키워드로 검색해보세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
