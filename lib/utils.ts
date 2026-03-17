import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatStage(stage: string) {
  return stage
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getLevelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 120) + 1);
}

export function getXpIntoCurrentLevel(xp: number) {
  return xp % 120;
}

export function getXpForNextLevel() {
  return 120;
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, '').trim();
}
