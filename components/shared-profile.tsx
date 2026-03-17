import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { themes } from '@/lib/theme';
import type { DashboardPayload } from '@/types/dashboard';

export function SharedProfile({
  user,
  dashboard,
}: {
  user: {
    username: string;
    avatarUrl: string | null;
    avatarSeed: string;
    createdAt: Date;
  };
  dashboard: DashboardPayload;
}) {
  const avatar =
    user.avatarUrl ||
    `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(user.avatarSeed)}`;

  return (
    <div className="container-shell py-10">
      <div className="glass gradient-border rounded-[2rem] p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <Image alt={user.username} fill src={avatar} unoptimized />
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-white/40">Public Profile</div>
              <h1 className="mt-2 text-4xl font-semibold text-white">{user.username}</h1>
              <p className="mt-3 text-sm text-muted">
                Shared progression snapshot from Minecraft Progression Companion.
              </p>
            </div>
          </div>
          <Link
            className="rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-slate-950"
            href="/register"
          >
            Build your own dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-muted">Progress</div>
            <div className="mt-2 text-3xl font-semibold text-white">{dashboard.stats.progress}%</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-muted">Stage</div>
            <div className="mt-2 text-3xl font-semibold text-white">{dashboard.stats.stageLabel}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-muted">Level</div>
            <div className="mt-2 text-3xl font-semibold text-white">{dashboard.stats.level}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-muted">Achievement count</div>
            <div className="mt-2 text-3xl font-semibold text-white">{dashboard.achievements.length}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 accent-text" />
              <h2 className="text-xl font-semibold text-white">Achievements</h2>
            </div>
            <div className="mt-5 space-y-3">
              {dashboard.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
                >
                  <div className="font-medium text-white">{achievement.achievement.name}</div>
                  <div className="mt-1 text-sm text-muted">
                    {achievement.achievement.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Progress by section</h2>
            <div className="mt-5 space-y-4">
              {dashboard.sectionSummaries.map((section) => (
                <div key={section.section}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{section.section}</span>
                    <span className="text-muted">{section.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${section.progress}%`,
                        background: `linear-gradient(90deg, ${themes[dashboard.stats.theme].accent}, rgba(255,255,255,0.95))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
