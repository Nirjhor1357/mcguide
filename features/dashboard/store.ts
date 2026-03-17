'use client';

import { create } from 'zustand';
import type { DashboardPayload, SerializableAchievement, SerializableTask } from '@/types/dashboard';
import { apiFetch } from '@/lib/client-api';
import { getLevelFromXp, getXpForNextLevel, getXpIntoCurrentLevel } from '@/lib/utils';

type StatusFilter = 'all' | 'completed' | 'incomplete';
type StageFilter = 'all' | 'BEGINNER' | 'MID_GAME' | 'ADVANCED' | 'ENDGAME';

type DashboardState = {
  tasks: SerializableTask[];
  achievements: SerializableAchievement[];
  stats: DashboardPayload['stats'];
  recommendedTask: SerializableTask | null;
  sectionSummaries: DashboardPayload['sectionSummaries'];
  search: string;
  statusFilter: StatusFilter;
  stageFilter: StageFilter;
  favoritesOnly: boolean;
  activeSection: string;
  theme: DashboardPayload['stats']['theme'];
  initialize: (payload: DashboardPayload) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setStageFilter: (stage: StageFilter) => void;
  setFavoritesOnly: (value: boolean) => void;
  setActiveSection: (section: string) => void;
  setTheme: (theme: DashboardPayload['stats']['theme']) => void;
  toggleTask: (taskId: string, completed: boolean) => Promise<void>;
  togglePinned: (taskId: string, pinned: boolean) => Promise<void>;
  addTask: (task: SerializableTask) => void;
  resetProgress: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
};

function recompute(payload: Pick<DashboardState, 'tasks' | 'achievements'>) {
  const completedTasks = payload.tasks.filter((task) => task.progress?.completed).length;
  const favoriteTasks = payload.tasks.filter((task) => task.progress?.pinned).length;
  const xp =
    payload.tasks
      .filter((task) => task.progress?.completed)
      .reduce((sum, task) => sum + task.xpReward, 0) +
    payload.achievements.reduce((sum, item) => sum + item.achievement.xpReward, 0);

  const progress = Math.round((completedTasks / Math.max(payload.tasks.length, 1)) * 100);
  const stage =
    progress >= 82
      ? 'ENDGAME'
      : progress >= 55
        ? 'ADVANCED'
        : progress >= 26
          ? 'MID_GAME'
          : 'BEGINNER';
  const sectionSummaries = Object.values(
    payload.tasks.reduce<Record<string, DashboardPayload['sectionSummaries'][number]>>(
      (acc, task) => {
        acc[task.section] ??= {
          section: task.section,
          total: 0,
          completed: 0,
          progress: 0,
          stage: task.stage,
        };
        acc[task.section].total += 1;
        if (task.progress?.completed) {
          acc[task.section].completed += 1;
        }
        acc[task.section].progress = Math.round(
          (acc[task.section].completed / Math.max(acc[task.section].total, 1)) * 100,
        );
        return acc;
      },
      {},
    ),
  );

  const recommendedTask =
    payload.tasks.find((task) => task.stage === stage && !task.progress?.completed) ??
    payload.tasks.find((task) => !task.progress?.completed) ??
    null;

  return {
    stats: {
      completedTasks,
      totalTasks: payload.tasks.length,
      progress,
      favoriteTasks,
      stage,
      stageLabel:
        stage === 'MID_GAME'
          ? 'Mid Game'
          : stage === 'ENDGAME'
            ? 'Endgame'
            : stage === 'ADVANCED'
              ? 'Advanced'
              : 'Beginner',
      theme:
        payload.tasks.filter((task) => task.progress?.completed && task.theme === 'END').length >
        payload.tasks.filter((task) => task.progress?.completed && task.theme === 'OVERWORLD').length
          ? 'END'
          : payload.tasks.filter((task) => task.progress?.completed && task.theme === 'NETHER').length >
              payload.tasks.filter((task) => task.progress?.completed && task.theme === 'OVERWORLD').length
            ? 'NETHER'
            : 'OVERWORLD',
      xp,
      level: getLevelFromXp(xp),
      currentLevelXp: getXpIntoCurrentLevel(xp),
      nextLevelXp: getXpForNextLevel(),
    } as DashboardPayload['stats'],
    sectionSummaries,
    recommendedTask,
  };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  tasks: [],
  achievements: [],
  stats: {
    completedTasks: 0,
    totalTasks: 0,
    progress: 0,
    favoriteTasks: 0,
    stage: 'BEGINNER',
    stageLabel: 'Beginner',
    theme: 'OVERWORLD',
    xp: 0,
    level: 1,
    currentLevelXp: 0,
    nextLevelXp: 120,
  },
  recommendedTask: null,
  sectionSummaries: [],
  search: '',
  statusFilter: 'all',
  stageFilter: 'all',
  favoritesOnly: false,
  activeSection: 'overview',
  theme: 'OVERWORLD',
  initialize: (payload) =>
    set({
      tasks: payload.tasks,
      achievements: payload.achievements,
      stats: payload.stats,
      recommendedTask: payload.recommendedTask,
      sectionSummaries: payload.sectionSummaries,
      theme: payload.stats.theme,
    }),
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setStageFilter: (stageFilter) => set({ stageFilter }),
  setFavoritesOnly: (favoritesOnly) => set({ favoritesOnly }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setTheme: (theme) => set({ theme }),
  toggleTask: async (taskId, completed) => {
    set((state) => {
      const tasks = state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progress: {
                completed,
                pinned: task.progress?.pinned ?? false,
                completedAt: completed ? new Date().toISOString() : null,
              },
            }
          : task,
      );
      return { ...recompute({ tasks, achievements: state.achievements }), tasks };
    });

    await apiFetch('/api/progress', {
      method: 'PATCH',
      body: JSON.stringify({ taskId, completed }),
    });
    await get().refreshFromServer();
  },
  togglePinned: async (taskId, pinned) => {
    set((state) => {
      const tasks = state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progress: {
                completed: task.progress?.completed ?? false,
                pinned,
                completedAt: task.progress?.completedAt ?? null,
              },
            }
          : task,
      );
      return { ...recompute({ tasks, achievements: state.achievements }), tasks };
    });

    await apiFetch('/api/progress', {
      method: 'PATCH',
      body: JSON.stringify({ taskId, pinned }),
    });
  },
  addTask: (task) =>
    set((state) => {
      const tasks = [...state.tasks, task].sort((a, b) => a.order - b.order);
      return { ...recompute({ tasks, achievements: state.achievements }), tasks };
    }),
  resetProgress: async () => {
    await apiFetch('/api/progress/reset', { method: 'POST', body: JSON.stringify({}) });
    await get().refreshFromServer();
  },
  refreshFromServer: async () => {
    const response = await apiFetch<{ dashboard: DashboardPayload }>('/api/dashboard');
    get().initialize(response.dashboard);
  },
}));
