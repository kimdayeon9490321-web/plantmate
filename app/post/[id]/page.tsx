import Shell from '@/components/Shell';

interface PostDetailProps {
  params: any;
}

export default function PostDetailPage({ params }: PostDetailProps) {
  const comments = [
    { id: 'c1', author: '수진', text: '좋은 질문이네요! 저도 비슷한 경험이 있어요.', date: '2026-06-10' },
    { id: 'c2', author: '민지', text: '저는 2주마다 흙을 확인합니다.', date: '2026-06-11' }
  ];

  return (
    <Shell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">게시글</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">수경재배 초보 질문</h1>
              <p className="mt-3 max-w-2xl text-slate-600">물 교체 주기나 영양제 사용 관련 팁을 공유해주세요.</p>
            </div>
            <div className="text-sm text-slate-500">2026-06-10 · 작성자: 민수</div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <textarea className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-brand-400 focus:outline-none" rows={4} placeholder="댓글을 작성하세요"></textarea>
            <button className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              댓글 등록
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">댓글</h2>
          <div className="mt-6 space-y-4">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
                  <span>{comment.author}</span>
                  <span>{comment.date}</span>
                </div>
                <p className="mt-3 text-slate-700">{comment.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
