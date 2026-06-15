'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useSupabaseClient } from '@/app/providers';

interface CommunityNewFormProps {
  plants: { id: string; name: string }[];
}

export default function CommunityNewForm({ plants }: CommunityNewFormProps) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [plantId, setPlantId] = useState(plants[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!session) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!plantId) {
      setError('식물을 선택해주세요.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.from('posts').insert([
      {
        user_id: session.user.id,
        plant_id: plantId,
        title,
        content,
        image_url: imageUrl || null
      }
    ]);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data?.[0]?.id) {
      router.push(`/community/${data[0].id}`);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">식물 선택</label>
          <select
            value={plantId}
            onChange={(event) => setPlantId(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
          >
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">제목</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">내용</label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
            className="mt-2 w-full min-h-[160px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">이미지 URL (선택)</label>
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
          className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? '등록 중...' : '게시글 작성'}
        </button>
      </form>
    </div>
  );
}
