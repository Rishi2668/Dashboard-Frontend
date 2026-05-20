import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import type { RevisionItem } from '@/types/revision';
import { STATUS_STYLES, overdueLabel } from '@/lib/revisionStatus';
import { revisionStageLabel } from '@/lib/revisionSchedule';
import { AnimatedCheckbox } from './AnimatedCheckbox';

interface RevisionCardProps {
  item: RevisionItem;
  onComplete: (id: number) => void;
  onDelete?: (id: number, topic: string) => void;
  deleting?: boolean;
  compact?: boolean;
}

export function RevisionCard({
  item,
  onComplete,
  onDelete,
  deleting,
  compact,
}: RevisionCardProps) {
  const status = item.status ?? 'upcoming';
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.upcoming;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      className={`flex items-start gap-3 p-3 rounded-xl border ${
        status === 'overdue'
          ? 'bg-red-500/10 border-red-500/25'
          : status === 'pending'
            ? 'bg-yellow-500/10 border-yellow-500/20'
            : status === 'completed'
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-white/5 border-white/10'
      }`}
    >
      {status !== 'completed' && (
        <AnimatedCheckbox
          checked={false}
          onToggle={() => onComplete(item.id)}
          disabled={deleting}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-medium text-white ${compact ? 'text-sm' : ''}`}>{item.topic}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style.badge}`}>
            {style.label}
          </span>
          {status === 'overdue' && (item.days_overdue ?? 0) > 0 && (
            <span className="text-[10px] text-red-300">{overdueLabel(item.days_overdue)}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.subject} · {revisionStageLabel(item.interval_days)} revision ·{' '}
          {format(new Date(item.next_revision_date), 'MMM d, yyyy')}
          {!compact && ` · Rev #${item.revision_count}`}
          {item.priority && item.priority !== 'medium' && ` · ${item.priority} priority`}
        </p>
        {item.notes && !compact && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.notes}</p>
        )}
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(item.id, item.topic)}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
