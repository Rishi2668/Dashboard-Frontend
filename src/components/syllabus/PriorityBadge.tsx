import { cn } from '@/lib/utils';
import type { Priority } from '@/types/syllabus';

const styles: Record<Priority, string> = {
  very_high: 'bg-red-500/20 text-red-300 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const labels: Record<Priority, string> = {
  very_high: 'Very High',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold',
        styles[priority],
        className
      )}
    >
      {labels[priority]}
    </span>
  );
}

export function PrioritySectionLabel({ priority }: { priority: Priority }) {
  const headings: Record<Priority, string> = {
    very_high: 'Very High Priority',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };
  return (
    <h4 className={cn('text-xs font-bold uppercase tracking-widest mt-4 mb-2', styles[priority].split(' ')[1])}>
      {headings[priority]}
    </h4>
  );
}
