'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/client-api';
import { BrandMark } from '@/components/brand-mark';

type AuthMode = 'login' | 'register';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === 'register'
        ? {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
          }
        : {
            email: formData.get('email'),
            password: formData.get('password'),
          };

    try {
      await apiFetch(mode === 'register' ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push('/dashboard');
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-shell grid min-h-screen place-items-center py-10">
      <motion.div
        className="glass gradient-border relative w-full max-w-md rounded-[2rem] p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <BrandMark />
          <h1 className="mt-6 text-3xl font-semibold text-white">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {mode === 'register'
              ? 'Sync progress across devices, unlock achievements, and build your personal Minecraft command center.'
              : 'Sign in to continue your progression journey.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === 'register' ? (
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Username</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
                name="username"
                required
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
              name="email"
              required
              type="email"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
              name="password"
              required
              type="password"
            />
          </label>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === 'register' ? 'Already have an account?' : 'Need an account?'}{' '}
          <Link
            className="font-medium text-white underline underline-offset-4"
            href={mode === 'register' ? '/login' : '/register'}
          >
            {mode === 'register' ? 'Login' : 'Register'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
