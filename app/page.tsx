import Link from 'next/link';
import Shell from '@/components/Shell';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function HomePage() {
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

  const [plantsResponse, journalsResponse, postsResponse] = await Promise.all([
    supabase.from('plants').select('id, name, summary').order('name').limit(6),
    supabase
      .from('journals')
      .select('id, title, created_at, user_plant_id, user_plants(plant_id, plants(name), profiles(display_name))')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('posts')
      .select('id, title, created_at, profiles(display_name), plants(name)')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const plants = plantsResponse.data ?? [];
  const journals = journalsResponse.data ?? [];
  const posts = postsResponse.data ?? [];

  return (
    <Shell>
      <div className="space-y-16">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#D5E7B5] via-[#F3E4C9] to-[#F3E4C9] px-6 py-16 text-[#3f4a3a] shadow-xl sm:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-6">
                <p className="inline-flex rounded-full bg-white/60 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#618764] shadow-sm">
                  PlantMate 소개
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-[#3f4a3a] sm:text-5xl break-keep">
                  식물 생활을 더 쉽고 즐겁게, PlantMate와 함께하세요.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[#5a6655] sm:text-lg">
                  식물 관찰부터 성장일지, 커뮤니티까지 한곳에서 관리할 수 있는 식물 관리 플랫폼입니다.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/plants"
                    className="inline-flex items-center justify-center rounded-full bg-[#618764] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#4f6f52]"
                  >
                    시작하기
                  </Link>
                  <Link
                    href="/community"
                    className="inline-flex items-center justify-center rounded-full border border-[#9CB080] bg-white/60 px-6 py-3 text-sm font-semibold text-[#618764] transition hover:bg-white"
                  >
                    커뮤니티 참여하기
                  </Link>
                </div>
              </div>
              <div className="rounded-[2rem] bg-white/70 p-8 text-[#5a6655] shadow-2xl shadow-black/5 backdrop-blur-sm sm:p-10">
                <div className="space-y-5">
                  <div className="rounded-3xl bg-white/80 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#618764]">PlantMate 기능</p>
                    <ul className="mt-4 space-y-3 text-sm text-[#5a6655]">
                      <li>• 실내 식물 도감과 맞춤형 관리</li>
                      <li>• 공개 성장일지로 나만의 기록 저장</li>
                      <li>• 같은 식물 사용자와 함께하는 커뮤니티</li>
                    </ul>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white/80 p-5">
                      <p className="text-2xl font-semibold text-[#618764]">6+</p>
                      <p className="mt-2 text-sm text-[#7a8775]">주요 인기 식물 정보</p>
                    </div>
                    <div className="rounded-3xl bg-white/80 p-5">
                      <p className="text-2xl font-semibold text-[#618764]">5+</p>
                      <p className="mt-2 text-sm text-[#7a8775]">최신 공개 성장일지</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">인기 식물</h2>
                <p className="mt-1 text-sm text-slate-500">가장 많이 찾는 식물을 먼저 확인해보세요.</p>
              </div>
              <Link href="/plants" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
                전체 식물 보기
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {plants.map((plant) => (
                <div key={plant.id} className="group rounded-3xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-brand-400">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">식물</p>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{plant.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{plant.summary}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">최근 커뮤니티 게시글</h2>
                <p className="mt-1 text-sm text-slate-500">PlantMate 커뮤니티에서 활발한 토픽을 확인하세요.</p>
              </div>
              <Link href="/community" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
                모두 보기
              </Link>
            </div>

            <div className="mt-8 space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block rounded-3xl border border-slate-200 p-5 transition hover:border-brand-400"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                    <span>{(post.profiles as any)?.display_name ?? '익명'}</span>
                    <span>·</span>
                    <span>{(post.plants as any)?.name ?? '식물'}</span>
                    <span>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">시작하기</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">식물 등록과 커뮤니티 참여를 지금 바로 시작하세요.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                관심 있는 식물을 찾고, 나만의 성장일지를 기록하며, 같은 식물을 키우는 이웃들과 소통해보세요.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/my-plants"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                식물 등록하기
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                커뮤니티 참여하기
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}