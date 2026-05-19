export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getStreakColor(count: number) {
  if (count >= 30) return 'text-orange-400';
  if (count >= 7) return 'text-amber-400';
  return 'text-slate-400';
}

export const SUBJECTS = ['Quant', 'Reasoning', 'English', 'GK'] as const;

export const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'from-slate-500 to-slate-600',
  'Consistent Learner': 'from-blue-500 to-blue-600',
  'SSC Warrior': 'from-purple-500 to-purple-600',
  'Rank Hunter': 'from-orange-500 to-orange-600',
  'Topper Mode': 'from-amber-400 to-yellow-500',
};
