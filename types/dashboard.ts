export type SerializableTask = {
  id: string;
  title: string;
  description: string;
  section: string;
  stage: 'BEGINNER' | 'MID_GAME' | 'ADVANCED' | 'ENDGAME';
  theme: 'OVERWORLD' | 'NETHER' | 'END';
  order: number;
  xpReward: number;
  isCore: boolean;
  isCustom: boolean;
  progress: {
    completed: boolean;
    pinned: boolean;
    completedAt: string | null;
  } | null;
};

export type SerializableAchievement = {
  id: string;
  unlockedAt: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  };
};

export type DashboardPayload = {
  tasks: SerializableTask[];
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
  recommendedTask: SerializableTask | null;
  sectionSummaries: {
    section: string;
    total: number;
    completed: number;
    progress: number;
    stage: 'BEGINNER' | 'MID_GAME' | 'ADVANCED' | 'ENDGAME';
  }[];
  achievements: SerializableAchievement[];
};
