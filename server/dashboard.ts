import { prisma } from '@/lib/prisma';
import { ensureCatalogSeeded } from '@/server/catalog-sync';
import {
  calculateExperience,
  detectStage,
  determineAchievementUnlocks,
  getRecommendedTask,
  getSectionSummaries,
  getStageLabel,
  getThemeMix,
  type TaskWithProgress,
} from '@/server/progression';

export async function getDashboardData(userId: string) {
  await ensureCatalogSeeded();

  const [tasks, achievements] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [{ isCore: true }, { creatorId: userId }],
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        progresses: {
          where: { userId },
          take: 1,
        },
      },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    }),
  ]);

  const normalizedTasks: TaskWithProgress[] = tasks.map((task) => ({
    ...task,
    progress: task.progresses[0] ?? null,
  }));

  const stage = detectStage(normalizedTasks);
  const recommendedTask = getRecommendedTask(normalizedTasks, stage);
  const sectionSummaries = getSectionSummaries(normalizedTasks);
  const unlockedCatalog = determineAchievementUnlocks(normalizedTasks);
  const unlockedIds = new Set(achievements.map((item) => item.achievementId));

  if (unlockedCatalog.length > 0) {
    for (const achievement of unlockedCatalog) {
      if (!unlockedIds.has(achievement.id)) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });
      }
    }
  }

  const refreshedAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
  });

  const experience = calculateExperience(normalizedTasks, refreshedAchievements);
  const completedTasks = normalizedTasks.filter((task) => task.progress?.completed).length;
  const totalTasks = normalizedTasks.length;
  const favoriteTasks = normalizedTasks.filter((task) => task.progress?.pinned).length;

  return {
    tasks: normalizedTasks,
    stats: {
      completedTasks,
      totalTasks,
      progress: Math.round((completedTasks / Math.max(totalTasks, 1)) * 100),
      favoriteTasks,
      stage,
      stageLabel: getStageLabel(stage),
      theme: getThemeMix(normalizedTasks),
      ...experience,
    },
    recommendedTask,
    sectionSummaries,
    achievements: refreshedAchievements,
  };
}
