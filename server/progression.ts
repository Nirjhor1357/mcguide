import { TaskStage, TaskTheme, type Achievement, type Progress, type Task, type UserAchievement } from '@prisma/client';
import { achievementCatalog } from '@/lib/catalog';
import { getLevelFromXp, getXpForNextLevel, getXpIntoCurrentLevel } from '@/lib/utils';

export type TaskWithProgress = Task & {
  progress: Progress | null;
};

export function getStageLabel(stage: TaskStage) {
  switch (stage) {
    case TaskStage.BEGINNER:
      return 'Beginner';
    case TaskStage.MID_GAME:
      return 'Mid Game';
    case TaskStage.ADVANCED:
      return 'Advanced';
    case TaskStage.ENDGAME:
      return 'Endgame';
    default:
      return 'Beginner';
  }
}

export function detectStage(tasks: TaskWithProgress[]) {
  const completed = tasks.filter((task) => task.progress?.completed);
  const completionRatio = completed.length / Math.max(tasks.length, 1);

  if (completionRatio >= 0.82) {
    return TaskStage.ENDGAME;
  }

  if (completionRatio >= 0.55 || completed.some((task) => task.stage === TaskStage.ADVANCED)) {
    return TaskStage.ADVANCED;
  }

  if (completionRatio >= 0.26 || completed.some((task) => task.stage === TaskStage.MID_GAME)) {
    return TaskStage.MID_GAME;
  }

  return TaskStage.BEGINNER;
}

export function getRecommendedTask(tasks: TaskWithProgress[], currentStage: TaskStage) {
  const stageFirst = tasks.find(
    (task) => task.stage === currentStage && !task.progress?.completed,
  );

  if (stageFirst) {
    return stageFirst;
  }

  return tasks.find((task) => !task.progress?.completed) ?? null;
}

export function calculateExperience(
  tasks: TaskWithProgress[],
  unlockedAchievements: (UserAchievement & { achievement: Achievement })[],
) {
  const taskXp = tasks
    .filter((task) => task.progress?.completed)
    .reduce((sum, task) => sum + task.xpReward, 0);

  const achievementXp = unlockedAchievements.reduce(
    (sum, item) => sum + item.achievement.xpReward,
    0,
  );

  const xp = taskXp + achievementXp;

  return {
    xp,
    level: getLevelFromXp(xp),
    currentLevelXp: getXpIntoCurrentLevel(xp),
    nextLevelXp: getXpForNextLevel(),
  };
}

export function getThemeMix(tasks: TaskWithProgress[]) {
  const counts = tasks.reduce<Record<TaskTheme, number>>(
    (acc, task) => {
      if (task.progress?.completed) {
        acc[task.theme] += 1;
      }
      return acc;
    },
    {
      [TaskTheme.OVERWORLD]: 0,
      [TaskTheme.NETHER]: 0,
      [TaskTheme.END]: 0,
    },
  );

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as TaskTheme;
}

export function getSectionSummaries(tasks: TaskWithProgress[]) {
  const grouped = tasks.reduce<Record<string, TaskWithProgress[]>>((acc, task) => {
    acc[task.section] ??= [];
    acc[task.section].push(task);
    return acc;
  }, {});

  return Object.entries(grouped).map(([section, sectionTasks]) => {
    const completed = sectionTasks.filter((task) => task.progress?.completed).length;
    return {
      section,
      total: sectionTasks.length,
      completed,
      progress: Math.round((completed / Math.max(sectionTasks.length, 1)) * 100),
      stage: sectionTasks[0]?.stage ?? TaskStage.BEGINNER,
    };
  });
}

export function determineAchievementUnlocks(tasks: TaskWithProgress[]) {
  const completedTaskIds = new Set(
    tasks.filter((task) => task.progress?.completed).map((task) => task.id),
  );
  const sectionCompletion = getSectionSummaries(tasks);

  return achievementCatalog.filter((achievement) => {
    if (achievement.unlockRule === 'complete_5_tasks') {
      return completedTaskIds.size >= 5;
    }

    if (achievement.unlockRule.startsWith('complete_section:')) {
      const section = achievement.unlockRule.replace('complete_section:', '');
      const target = sectionCompletion.find((item) => item.section === section);
      return Boolean(target && target.completed === target.total);
    }

    if (achievement.unlockRule.startsWith('complete_task:')) {
      const taskId = achievement.unlockRule.replace('complete_task:', '');
      return completedTaskIds.has(taskId);
    }

    return false;
  });
}
