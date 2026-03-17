'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Compass,
  Flame,
  Gem,
  LogOut,
  MapPinned,
  Plus,
  Search,
  Shield,
  Sparkles,
  Star,
  Sword,
  Trophy,
} from 'lucide-react';
import { useDashboardStore } from '@/features/dashboard/store';
import { apiFetch } from '@/lib/client-api';
import { themes } from '@/lib/theme';
import type { DashboardPayload } from '@/types/dashboard';
import { cn, formatStage } from '@/lib/utils';

type DashboardShellProps = {
  user: {
    username: string;
    email: string;
    avatarUrl: string | null;
    avatarSeed: string;
  };
  initialData: DashboardPayload;
};

const achievementIcons = {
  MoonStar: Shield,
  Shield,
  Gem,
  Swords: Sword,
};

export function DashboardShell({ user, initialData }: DashboardShellProps) {
  const router = useRouter();
  const [customTaskOpen, setCustomTaskOpen] = useState(false);
  const [customTaskError, setCustomTaskError] = useState('');
  const {
    initialize,
    tasks,
    achievements,
    stats,
    recommendedTask,
    sectionSummaries,
    search,
    statusFilter,
    stageFilter,
    favoritesOnly,
    activeSection,
    theme,
    setSearch,
    setStatusFilter,
    setStageFilter,
    setFavoritesOnly,
    setActiveSection,
    setTheme,
    toggleTask,
    togglePinned,
    addTask,
    resetProgress,
  } = useDashboardStore();

  useEffect(() => {
    initialize(initialData);
  }, [initialize, initialData]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-section-nav]');
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-25% 0px -50% 0px',
        threshold: [0.2, 0.4, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [setActiveSection, tasks]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase()) ||
          task.section.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'completed'
              ? Boolean(task.progress?.completed)
              : !task.progress?.completed;
        const matchesStage = stageFilter === 'all' ? true : task.stage === stageFilter;
        const matchesFavorite = favoritesOnly ? Boolean(task.progress?.pinned) : true;
        return matchesSearch && matchesStatus && matchesStage && matchesFavorite;
      }),
    [tasks, search, statusFilter, stageFilter, favoritesOnly],
  );

  const groupedTasks = useMemo(
    () =>
      filteredTasks.reduce<Record<string, typeof filteredTasks>>((acc, task) => {
        acc[task.section] ??= [];
        acc[task.section].push(task);
        return acc;
      }, {}),
    [filteredTasks],
  );

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });
    router.push('/login');
    router.refresh();
  }

  async function handleCustomTaskSubmit(formData: FormData) {
    setCustomTaskError('');

    try {
      const response = await apiFetch<{ task: DashboardPayload['tasks'][number] }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          section: formData.get('section'),
          stage: formData.get('stage'),
          theme: formData.get('theme'),
        }),
      });
      addTask({
        ...response.task,
        progress: null,
      });
      setCustomTaskOpen(false);
    } catch (requestError) {
      setCustomTaskError(
        requestError instanceof Error ? requestError.message : 'Unable to create task',
      );
    }
  }

  async function handleCustomTaskFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleCustomTaskSubmit(new FormData(event.currentTarget));
  }

  const avatar =
    user.avatarUrl ||
    `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(user.avatarSeed)}`;

  return (
    <div className="pb-16">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
        <div className="container-shell flex flex-col gap-4 py-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <Image alt={user.username} fill src={avatar} unoptimized />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/50">Control Room</p>
                <h1 className="text-2xl font-semibold text-white">
                  Welcome back, {user.username}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(['OVERWORLD', 'NETHER', 'END'] as const).map((themeKey) => (
                <button
                  key={themeKey}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm transition',
                    theme === themeKey
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white',
                  )}
                  onClick={() => setTheme(themeKey)}
                  type="button"
                >
                  {themes[themeKey].name}
                </button>
              ))}
              <Link
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                href={`/share/${user.username}`}
              >
                Public Profile
              </Link>
              <Link
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                href="/profile"
              >
                Profile
              </Link>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                onClick={handleLogout}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </span>
              </button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'section-filters', label: 'Task Control' },
              ...sectionSummaries.map((section) => ({
                id: `section-${section.section.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                label: section.section,
              })),
            ].map((item) => (
              <a
                key={item.id}
                className={cn(
                  'shrink-0 rounded-full px-3 py-2 text-sm transition',
                  activeSection === item.id
                    ? 'bg-white/10 text-white shadow-accent'
                    : 'bg-white/5 text-slate-400 hover:text-white',
                )}
                href={`#${item.id}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="container-shell space-y-8 pt-8">
        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]" data-section-nav id="overview">
          <motion.div
            className="glass gradient-border rounded-[2rem] p-6 sm:p-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-sm accent-text">
                  Personalized command center
                </div>
                <h2 className="mt-4 text-4xl font-semibold text-white">
                  Progression intelligence for your survival world
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                  Sync checklist progress, discover your current stage, pin strategic milestones,
                  and let the platform recommend what to do next.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="text-sm text-muted">Current stage</div>
                <div className="mt-2 text-2xl font-semibold text-white">{stats.stageLabel}</div>
                <div className="mt-3 text-sm accent-text">Theme bias: {themes[theme].name}</div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Overall progress', value: `${stats.progress}%`, icon: Compass },
                {
                  label: 'Completed tasks',
                  value: `${stats.completedTasks}/${stats.totalTasks}`,
                  icon: Trophy,
                },
                { label: 'XP earned', value: `${stats.xp} XP`, icon: Sparkles },
                { label: 'Pinned tasks', value: `${stats.favoriteTasks}`, icon: Star },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  whileHover={{ y: -3, scale: 1.01 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft accent-text">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-sm text-muted">{card.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{card.value}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/55 p-5">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Level {stats.level}</span>
                <span>
                  {stats.currentLevelXp}/{stats.nextLevelXp} XP
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  animate={{ width: `${(stats.currentLevelXp / stats.nextLevelXp) * 100}%` }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${themes[theme].accent}, rgba(255,255,255,0.95))`,
                  }}
                />
              </div>
            </div>
          </motion.div>

          <motion.aside
            className="glass gradient-border rounded-[2rem] p-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="flex items-center gap-3">
              <MapPinned className="h-5 w-5 accent-text" />
              <h3 className="text-lg font-semibold text-white">Recommended next task</h3>
            </div>
            {recommendedTask ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm accent-text">{recommendedTask.section}</div>
                <div className="mt-2 text-xl font-semibold text-white">{recommendedTask.title}</div>
                <p className="mt-3 text-sm leading-6 text-muted">{recommendedTask.description}</p>
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                  <BadgeCheck className="h-4 w-4 accent-text" />
                  Stage: {formatStage(recommendedTask.stage)}
                </div>
                <button
                  className="mt-5 w-full rounded-2xl bg-[var(--accent)] px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90"
                  onClick={() =>
                    toggleTask(recommendedTask.id, !(recommendedTask.progress?.completed ?? false))
                  }
                  type="button"
                >
                  {recommendedTask.progress?.completed ? 'Mark as pending' : 'Complete this task'}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">You have completed every tracked milestone.</p>
            )}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Achievements</h4>
                <span className="text-sm text-muted">{achievements.length} unlocked</span>
              </div>
              <div className="mt-4 space-y-3">
                {achievements.slice(0, 4).map((item) => {
                  const Icon =
                    achievementIcons[item.achievement.icon as keyof typeof achievementIcons] ??
                    Trophy;
                  return (
                    <motion.div
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft accent-text">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{item.achievement.name}</div>
                        <div className="mt-1 text-sm text-muted">{item.achievement.description}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </section>

        <section className="glass gradient-border rounded-[2rem] p-6" data-section-nav id="section-filters">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-[var(--accent)]"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks, sections, or progression goals"
                value={search}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                value={statusFilter}
              >
                <option value="all">All status</option>
                <option value="completed">Completed</option>
                <option value="incomplete">Incomplete</option>
              </select>
              <select
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                onChange={(event) => setStageFilter(event.target.value as typeof stageFilter)}
                value={stageFilter}
              >
                <option value="all">All stages</option>
                <option value="BEGINNER">Beginner</option>
                <option value="MID_GAME">Mid Game</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ENDGAME">Endgame</option>
              </select>
              <button
                className={cn(
                  'rounded-2xl border px-4 py-3 text-sm transition',
                  favoritesOnly
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300',
                )}
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                type="button"
              >
                Favorites only
              </button>
              <button
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                onClick={() => setCustomTaskOpen((value) => !value)}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Custom task
                </span>
              </button>
              <button
                className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 transition hover:bg-rose-500/15"
                onClick={() => resetProgress()}
                type="button"
              >
                Reset progress
              </button>
            </div>
          </div>

          {customTaskOpen ? (
            <form
              className="mt-5 grid gap-4 rounded-3xl border border-white/10 bg-slate-950/45 p-5 md:grid-cols-2"
              onSubmit={handleCustomTaskFormSubmit}
            >
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                name="title"
                placeholder="Task title"
                required
              />
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                name="section"
                placeholder="Section"
                required
              />
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none md:col-span-2"
                name="description"
                placeholder="Why this task matters"
                required
              />
              <select
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                defaultValue="MID_GAME"
                name="stage"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="MID_GAME">Mid Game</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ENDGAME">Endgame</option>
              </select>
              <select
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                defaultValue={theme}
                name="theme"
              >
                <option value="OVERWORLD">Overworld</option>
                <option value="NETHER">Nether</option>
                <option value="END">End</option>
              </select>
              {customTaskError ? (
                <p className="text-sm text-rose-300 md:col-span-2">{customTaskError}</p>
              ) : null}
              <button
                className="rounded-2xl bg-[var(--accent)] px-4 py-3 font-semibold text-slate-950"
                type="submit"
              >
                Save custom task
              </button>
            </form>
          ) : null}
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
          <aside className="space-y-4">
            {sectionSummaries.map((section) => (
              <div key={section.section} className="glass gradient-border rounded-[1.75rem] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                      {formatStage(section.stage)}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">{section.section}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-white">{section.progress}%</div>
                    <div className="text-sm text-muted">
                      {section.completed}/{section.total}
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    animate={{ width: `${section.progress}%` }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${themes[theme].accent}, rgba(255,255,255,0.95))`,
                    }}
                  />
                </div>
              </div>
            ))}
          </aside>

          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([section, sectionTasks], sectionIndex) => {
              const sectionId = `section-${section.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

              return (
                <motion.section
                  key={section}
                  className="glass gradient-border rounded-[2rem] p-6"
                  data-section-nav
                  id={sectionId}
                  initial={{ opacity: 0, y: 16 }}
                  transition={{ delay: sectionIndex * 0.03 }}
                  viewport={{ amount: 0.2, once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm accent-text">{sectionTasks[0]?.theme}</div>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{section}</h3>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      {sectionTasks.filter((task) => task.progress?.completed).length}/{sectionTasks.length} complete
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {sectionTasks.map((task) => {
                      const complete = Boolean(task.progress?.completed);
                      const pinned = Boolean(task.progress?.pinned);
                      const ThemeIcon =
                        task.theme === 'NETHER' ? Flame : task.theme === 'END' ? Gem : Shield;

                      return (
                        <motion.div
                          key={task.id}
                          className={cn(
                            'rounded-3xl border p-5 transition',
                            complete
                              ? 'border-white/15 bg-white/8'
                              : 'border-white/10 bg-slate-950/40 hover:border-white/20',
                          )}
                          whileHover={{ y: -2, scale: 1.005 }}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-4">
                              <button
                                className={cn(
                                  'mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border transition',
                                  complete
                                    ? 'border-transparent bg-[var(--accent)] text-slate-950'
                                    : 'border-white/10 bg-white/5 text-white',
                                )}
                                onClick={() => toggleTask(task.id, !complete)}
                                type="button"
                              >
                                <ThemeIcon className="h-4 w-4" />
                              </button>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                                    {formatStage(task.stage)}
                                  </span>
                                  {task.isCustom ? (
                                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                                      Custom
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                                  {task.description}
                                </p>
                                <div className="mt-3 text-sm accent-text">{task.xpReward} XP reward</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                className={cn(
                                  'rounded-2xl border px-4 py-2 text-sm transition',
                                  pinned
                                    ? 'border-white/20 bg-white/10 text-white'
                                    : 'border-white/10 bg-white/5 text-slate-300',
                                )}
                                onClick={() => togglePinned(task.id, !pinned)}
                                type="button"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Star className="h-4 w-4" />
                                  {pinned ? 'Pinned' : 'Pin task'}
                                </span>
                              </button>
                              <button
                                className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950"
                                onClick={() => toggleTask(task.id, !complete)}
                                type="button"
                              >
                                {complete ? 'Undo' : 'Complete'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
