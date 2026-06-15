import Link from 'next/link';
import Shell from '@/components/Shell';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function CommunityPage() {
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
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, created_at, profiles(display_name), plants(name)')
    .order('created_at', { ascending: false });

  return (
    <Shell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">커뮤니티</h1>
              <p className="mt-2 text-slate-600">같은 식물을 키우는 사용자들과 정보를 나누어보세요.</p>
            </div>
            <Link
              href="/community/new"
              className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              게시글 작성
            </Link>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
            <p>게시글을 불러오는 중 오류가 발생했습니다.</p>
            <pre className="mt-4 text-xs whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
          </div>
        ) : posts?.length ? (
          <div className="grid gap-4">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-900">{post.title}</h2>
                  <span className="text-sm text-slate-500">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{post.profiles?.display_name ?? '익명'}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{post.plants?.name ?? '알 수 없음'}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">등록된 게시글이 없습니다.</h2>
            <p className="mt-3 text-slate-600">첫 게시글을 작성해보세요.</p>
            <Link href="/community/new" className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              게시글 작성하기
            </Link>
          </div>
        )}
      </div>
    </Shell>
  );
}