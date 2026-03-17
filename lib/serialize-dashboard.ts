import type { Achievement, UserAchievement } from '@prisma/client';
import type { DashboardPayload } from '@/types/dashboard';
import type { TaskWithProgress } from '@/server/progression';

export function serializeDashboard(data: {
  tasks: TaskWithProgress[];
  stats: {
    completedTasks: number;
    totalTasks: number;
    progress: number;
    favoriteTasks: number;
    stage: 'BEGINNER' | 'MID_GAME' | 'ADVANCED' | 'ENDGAME';
    stageLabel: string;
    theme: 'OVERWORLD' | 'NETHER' | 'END';
    xp: number;
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
  };
  recommendedTask: TaskWithProgress | null;
  sectionSummaries: {
    section: string;
    total: number;
    completed: number;
    progress: number;
    stage: 'BEGINNER' | 'MID_GAME' | 'ADVANCED' | 'ENDGAME';
  }[];
  achievements: (UserAchievement & { achievement: Achievement })[];
}): DashboardPayload {
  return {
    tasks: data.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      section: task.section,
      stage: task.stage,
      theme: task.theme,
      order: task.order,
      xpReward: task.xpReward,
      isCore: task.isCore,
      isCustom: task.isCustom,
      progress: task.progress
        ? {
            completed: task.progress.completed,
            pinned: task.progress.pinned,
            completedAt: task.progress.completedAt?.toISOString() ?? null,
          }
        : null,
    })),
    stats: data.stats as DashboardPayload['stats'],
    recommendedTask: data.recommendedTask
      ? {
          id: data.recommendedTask.id,
          title: data.recommendedTask.title,
          description: data.recommendedTask.description,
          section: data.recommendedTask.section,
          stage: data.recommendedTask.stage,
          theme: data.recommendedTask.theme,
          order: data.recommendedTask.order,
          xpReward: data.recommendedTask.xpReward,
          isCore: data.recommendedTask.isCore,
          isCustom: data.recommendedTask.isCustom,
          progress: data.recommendedTask.progress
            ? {
                completed: data.recommendedTask.progress.completed,
                pinned: data.recommendedTask.progress.pinned,
                completedAt:
                  data.recommendedTask.progress.completedAt?.toISOString() ?? null,
              }
            : null,
        }
      : null,
    sectionSummaries: data.sectionSummaries as DashboardPayload['sectionSummaries'],
    achievements: data.achievements.map((item) => ({
      id: item.id,
      unlockedAt: item.unlockedAt.toISOString(),
      achievement: {
        id: item.achievement.id,
        name: item.achievement.name,
        description: item.achievement.description,
        icon: item.achievement.icon,
        xpReward: item.achievement.xpReward,
      },
    })),
  };
}
