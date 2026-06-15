'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useSupabaseClient } from '@/app/providers';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: { display_name: string } | null;
}

interface PostDetailProps {
  post: {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
    plant: { name: string } | null;
    profile: { display_name: string } | null;
    user_id: string;
  };
  initialComments: Comment[];
}

export default function CommunityPostDetail({ post, initialComments }: PostDetailProps) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.image_url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const isOwner = useMemo(() => session?.user?.id === post.user_id, [session, post.user_id]);

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    setLoading(true);
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/community');
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('posts')
      .update({ title, content, image_url: imageUrl || null })
      .eq('id', post.id);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    setEditing(false);
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommentError(null);

    if (!session) {
      setCommentError('로그인 후 댓글을 작성할 수 있습니다.');
      return;
    }

    if (!newComment.trim()) {
      setCommentError('댓글 내용을 입력해주세요.');
      return;
    }

    setCommentLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: post.id,
          user_id: session.user.id,
          content: newComment.trim()
        }
      ])
      .select('id, content, created_at, user_id, profiles(display_name)')
      .single();

    setCommentLoading(false);

    if (error) {
      setCommentError(error.message);
      return;
    }

    if (data) {
      setComments((current) => [...current, data]);
      setNewComment('');
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    setDeletingCommentId(commentId);
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    setDeletingCommentId(null);

    if (error) {
      setCommentError(error.message);
      return;
    }

    setComments((current) => current.filter((comment) => comment.id !== commentId));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">게시글 정보</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{post.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-slate-600">
              <span>작성자: {post.profile?.display_name ?? '익명'}</span>
              <span>식물: {post.plant?.name ?? '알 수 없음'}</span>
              <span>작성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
          {isOwner ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing((prev) => !prev)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {editing ? '편집 취소' : '게시글 수정'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">제목</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">내용</label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="mt-2 w-full min-h-[160px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">이미지 URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? '저장 중...' : '수정 저장'}
            </button>
          </form>
        ) : null}
      </div>

      {!editing ? (
        <>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="whitespace-pre-line text-slate-600">{post.content}</p>
            {post.image_url ? (
              <img src={post.image_url} alt={post.title} className="mt-6 w-full rounded-3xl object-cover" />
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">댓글 ({comments.length})</h2>
                <p className="mt-1 text-sm text-slate-600">오래된 순으로 댓글이 정렬됩니다.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {session ? (
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">댓글 작성</label>
                    <textarea
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      rows={4}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
                      placeholder="댓글을 입력해주세요."
                    />
                  </div>

                  {commentError ? <p className="text-sm text-rose-600">{commentError}</p> : null}

                  <button
                    type="submit"
                    disabled={commentLoading}
                    className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {commentLoading ? '댓글 등록 중...' : '댓글 등록'}
                  </button>
                </form>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  댓글을 작성하려면 로그인해야 합니다.
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              {comments.length ? (
                comments.map((comment) => {
                  const isCommentOwner = comment.user_id === session?.user?.id;
                  return (
                    <div key={comment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">{comment.profile?.display_name ?? '익명'}</p>
                          <p className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString('ko-KR')}</p>
                        </div>
                        {isCommentOwner ? (
                          <button
                            type="button"
                            onClick={() => handleCommentDelete(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingCommentId === comment.id ? '삭제 중...' : '삭제'}
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-4 whitespace-pre-line text-slate-700">{comment.content}</p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                  아직 등록된 댓글이 없습니다.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
