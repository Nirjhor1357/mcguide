export const themes = {
  OVERWORLD: {
    name: 'Overworld',
    accent: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.3)',
    ring: 'rgba(34, 197, 94, 0.35)',
  },
  NETHER: {
    name: 'Nether',
    accent: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.32)',
    ring: 'rgba(244, 63, 94, 0.34)',
  },
  END: {
    name: 'End',
    accent: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.3)',
    ring: 'rgba(139, 92, 246, 0.34)',
  },
} as const;

export type ThemeKey = keyof typeof themes;
