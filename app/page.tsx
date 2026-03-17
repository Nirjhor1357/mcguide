import { redirect } from 'next/navigation';
import { ArrowRight, BadgeCheck, Gem, Shield, Sparkles, Sword } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { SiteShell } from '@/components/site-shell';

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div>
      <SiteShell />
      <main>
        <section className="container-shell grid gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-sm accent-text">
              Startup-grade Minecraft progression intelligence
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Transform your survival run into a beautiful, intelligent progression platform.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Track milestones across devices, unlock achievements, get dynamic next-step guidance,
              and manage your world like a premium SaaS dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-slate-950"
                href="/register"
              >
                Launch your dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-white"
                href="/login"
              >
                Login
              </a>
            </div>
          </div>

          <div className="glass gradient-border rounded-[2rem] p-8" id="dashboard-preview">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Adaptive progression', icon: Sparkles },
                { label: 'Cross-device sync', icon: BadgeCheck },
                { label: 'Achievement system', icon: Sword },
                { label: 'Premium theming', icon: Gem },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft accent-text">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-white">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-shell pb-20" id="features">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: 'Personalized dashboard',
                description: 'Surface progress, XP, level, active stage, smart recommendations, and pinned tasks in one command center.',
              },
              {
                title: 'Secure full-stack auth',
                description: 'JWT access and refresh tokens, bcrypt hashing, protected routes, validation, cookies, and server-backed sessions.',
              },
              {
                title: 'World-aware progression themes',
                description: 'Switch between Overworld, Nether, and End visual identities while retaining a cohesive premium aesthetic.',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass gradient-border rounded-[2rem] p-6">
                <Shield className="h-6 w-6 accent-text" />
                <h2 className="mt-5 text-2xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
