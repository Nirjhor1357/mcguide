'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/client-api';

type ProfileFormProps = {
  user: {
    username: string;
    email: string;
    avatarUrl: string | null;
    avatarSeed: string;
    createdAt: Date | string;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [username, setUsername] = useState(user.username);
  const preview = useMemo(
    () =>
      avatarUrl ||
      `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(username || user.avatarSeed)}`,
    [avatarUrl, username, user.avatarSeed],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ username, avatarUrl }),
      });
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="glass gradient-border rounded-[2rem] p-6 sm:p-8" onSubmit={onSubmit}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <Image alt={username} fill src={preview} unoptimized />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-white">Profile Settings</h1>
          <p className="mt-2 text-sm text-muted">
            Update your display identity and public profile card.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Username</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setUsername(event.target.value)}
            value={username}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Avatar URL</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://..."
            value={avatarUrl}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Email</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400 outline-none"
            disabled
            value={user.email}
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          Member since {new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(user.createdAt))}
        </p>
        <button
          className="rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
