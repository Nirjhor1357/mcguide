import { prisma } from '@/lib/prisma';
import { achievementCatalog, taskCatalog } from '@/lib/catalog';

let syncPromise: Promise<void> | null = null;

export function ensureCatalogSeeded() {
  if (!syncPromise) {
    syncPromise = (async () => {
      await prisma.$transaction([
        ...taskCatalog.map((task) =>
          prisma.task.upsert({
            where: { id: task.id },
            update: {
              title: task.title,
              description: task.description,
              section: task.section,
              stage: task.stage,
              theme: task.theme,
              order: task.order,
              xpReward: task.xpReward,
              isCore: true,
            },
            create: {
              ...task,
              isCore: true,
              isCustom: false,
            },
          }),
        ),
        ...achievementCatalog.map((achievement) =>
          prisma.achievement.upsert({
            where: { id: achievement.id },
            update: achievement,
            create: achievement,
          }),
        ),
      ]);
    })().finally(() => {
      syncPromise = null;
    });
  }

  return syncPromise;
}
