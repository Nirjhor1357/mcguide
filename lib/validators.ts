import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const profileSchema = z.object({
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const progressUpdateSchema = z.object({
  taskId: z.string().min(1),
  completed: z.boolean().optional(),
  pinned: z.boolean().optional(),
});

export const customTaskSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().min(8).max(180),
  section: z.string().min(2).max(40),
  stage: z.enum(['BEGINNER', 'MID_GAME', 'ADVANCED', 'ENDGAME']),
  theme: z.enum(['OVERWORLD', 'NETHER', 'END']),
});
