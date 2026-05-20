import type { RevisionStatus } from '@/types/revision';

export const STATUS_STYLES: Record<
  RevisionStatus,
  { badge: string; ring: string; label: string }
> = {
  pending: {
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    ring: 'text-yellow-400',
    label: 'Pending',
  },
  upcoming: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    ring: 'text-blue-400',
    label: 'Upcoming',
  },
  completed: {
    badge: 'bg-green-500/20 text-green-300 border-green-500/30',
    ring: 'text-green-400',
    label: 'Completed',
  },
  overdue: {
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    ring: 'text-red-400',
    label: 'Overdue',
  },
};

export function overdueLabel(days: number): string {
  if (days <= 0) return '';
  return days === 1 ? '1 day overdue' : `${days} days overdue`;
}
