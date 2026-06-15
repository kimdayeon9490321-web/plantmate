'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSupabaseClient, useSession } from '@/app/providers';

interface Journal {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface JournalManagerProps {
  userPlantId: string;
}

const initialFormState = {
  title: '',
  content: '',
  image_url: '',
  is_public: true
};

export default function JournalManager({ userPlantId }: JournalManagerProps) {
  const session = useSession();
  const supabase = useSupabaseClient();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [formState, setFormState] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isOwner = useMemo(() => Boolean(session?.user?.id), [session]);

  const loadJournals = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('journals')
      .select('id, title, content, image_url, is_public, created_at, updated_at')
      .eq('user_plant_id', userPlantId)
      .order('created_at', { ascending: false });

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setJournals(data || []);
  };

  useEffect(() => {
    loadJournals();
  }, [userPlantId]);

  const resetForm = () => {
    setEditingId(null);
    setFormState(initialFormState);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      user_plant_id: userPlantId,
      title: formState.title,
      content: formState.content,
      image_url: formState.image_url || null,
      is_public: formState.is_public
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from('journals')
        .update(payload)
        .eq('id', editingId);

      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }

      await loadJournals();
      resetForm();
      return;
    }

    const { error: insertError } = await supabase.from('journals').insert([payload]);
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await loadJournals();
    resetForm();
  };

  const handleEdit = (journal: Journal) => {
    setEditingId(journal.id);
    setFormState({
      title: journal.title,
      content: journal.content,
      image_url: journal.image_url ?? '',
      is_public: journal.is_public
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (journalId: string) => {
    if (!confirm('이 일지를 삭제하시겠습니까?')) {
      return;
    }

    setSaving(true);
    const { error: deleteError } = await supabase.from('journals').delete().eq('id', journalId);
    setSaving(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadJournals();
  };

  if (!isOwner) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-600 shadow-sm">
        로그인한 사용자만 성장일지를 관리할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">데이터를 불러오는 중입니다...</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">{error}</div>
        ) : journals.length ? (
          <div className="grid gap-4">
            {journals.map((journal) => (
              <article key={journal.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-700">{new Date(journal.created_at).toLocaleDateString('ko-KR')}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{journal.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${journal.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {journal.is_public ? '공개' : '비공개'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEdit(journal)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(journal.id)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line text-slate-600">{journal.content}</p>
                {journal.image_url ? (
                  <img src={journal.image_url} alt={journal.title} className="mt-4 max-h-64 w-full rounded-3xl object-cover" />
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-600 shadow-sm">
            아직 작성된 성장일지가 없습니다. 아래 폼으로 일지를 추가해보세요.
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">성장일지 작성</h2>
            <p className="mt-2 text-slate-600">일지를 작성하고 공개 여부를 설정할 수 있습니다.</p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              작성 취소
            </button>
          ) : null}
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">제목</label>
            <input
              type="text"
              value={formState.title}
              onChange={(event) => setFormState({ ...formState, title: event.target.value })}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">내용</label>
            <textarea
              value={formState.content}
              onChange={(event) => setFormState({ ...formState, content: event.target.value })}
              required
              className="mt-2 w-full min-h-[160px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">이미지 URL</label>
            <input
              type="url"
              value={formState.image_url}
              onChange={(event) => setFormState({ ...formState, image_url: event.target.value })}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formState.is_public}
                onChange={(event) => setFormState({ ...formState, is_public: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              공개 일지로 저장
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? (editingId ? '수정 중...' : '저장 중...') : editingId ? '일지 수정' : '일지 작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
