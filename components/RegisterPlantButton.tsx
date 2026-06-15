'use client';

import { useState } from 'react';
import { useSession, useSupabaseClient } from '@/app/providers';

interface RegisterPlantButtonProps {
  plantId: string;
  plantName: string;
  alreadyRegistered: boolean;
}

export default function RegisterPlantButton({ plantId, plantName, alreadyRegistered }: RegisterPlantButtonProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [status, setStatus] = useState(alreadyRegistered ? 'registered' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!session) return null;

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.from('user_plants').insert([
      {
        user_id: session.user.id,
        plant_id: plantId,
        nickname: plantName
      }
    ]);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setStatus('registered');
  };

  if (status === 'registered') {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-900 shadow-sm">
        이미 등록된 식물입니다.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
        className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? '등록 중...' : '내 식물 등록'}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
