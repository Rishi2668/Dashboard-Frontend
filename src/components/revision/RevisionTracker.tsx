import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw, ChevronRight, AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { revisionApi } from '@/api';
import { buildDashboardFromItems, enrichRevisionItem } from '@/lib/revisionFallback';
import type { RevisionDashboardSummary } from '@/types/revision';
import { RevisionCard } from './RevisionCard';
import toast from 'react-hot-toast';

interface RevisionTrackerProps {
  onComplete?: () => void;
  compact?: boolean;
}

export function RevisionTracker({ onComplete, compact }: RevisionTrackerProps) {
  const [summary, setSummary] = useState<RevisionDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await revisionApi.dashboard();
      setSummary({
        ...data,
        today_items: (data.today_items ?? []).map((i) =>
          enrichRevisionItem(i as unknown as Record<string, unknown>)
        ),
        tomorrow_items: (data.tomorrow_items ?? []).map((i) =>
          enrichRevisionItem(i as unknown as Record<string, unknown>)
        ),
        overdue_items: (data.overdue_items ?? []).map((i) =>
          enrichRevisionItem(i as unknown as Record<string, unknown>)
        ),
        completion_percentage: Number(data.completion_percentage ?? 0),
      });
    } catch {
      try {
        const { data } = await revisionApi.list({ limit: 200 });
        setSummary(buildDashboardFromItems(data.items));
      } catch {
        setSummary(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleComplete = async (id: number) => {
    try {
      await revisionApi.complete(id);
      toast.success('Revision completed!');
      await load();
      onComplete?.();
    } catch {
      toast.error('Could not complete revision');
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="h-32 animate-pulse bg-white/5 rounded-xl" />
      </GlassCard>
    );
  }

  if (!summary) return null;

  const focusItems = [...(summary.overdue_items ?? []), ...(summary.today_items ?? [])].slice(
    0,
    compact ? 3 : 5
  );

  return (
    <GlassCard className="perf-content-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="text-blue-400" size={22} />
          <div>
            <h3 className="font-semibold text-white">Revision Tracker</h3>
            <p className="text-xs text-slate-500">3 → 7 → 15 day revision cycle</p>
          </div>
        </div>
        <Link
          to="/revision"
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          Open planner <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Widget
          icon={Calendar}
          label="Today"
          value={summary.today_count}
          color="text-yellow-400"
          bg="bg-yellow-500/10"
        />
        <Widget
          icon={Calendar}
          label="Tomorrow"
          value={summary.tomorrow_count}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <Widget
          icon={AlertTriangle}
          label="Overdue"
          value={summary.overdue_count}
          color="text-red-400"
          bg="bg-red-500/10"
        />
        <Widget
          icon={CheckCircle2}
          label="Done"
          value={summary.completed_count}
          color="text-green-400"
          bg="bg-green-500/10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-white/5 rounded-xl">
        <ProgressRing
          progress={summary.completion_percentage}
          size={compact ? 72 : 88}
          centerText={`${Math.round(summary.completion_percentage)}%`}
          centerHint="completion"
        />
        <div className="text-sm space-y-1">
          <p className="text-slate-400">
            <span className="text-white font-medium">{summary.pending_count}</span> pending ·{' '}
            <span className="text-blue-300">{summary.upcoming_count}</span> upcoming
          </p>
          <p className="text-slate-400">
            Revision streak: <span className="text-orange-400 font-medium">{summary.revision_streak}🔥</span>
          </p>
          <p className="text-xs text-slate-500">{summary.week_count} due this week</p>
        </div>
      </div>

      {focusItems.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-500">Action needed</p>
          {focusItems.map((item) => (
            <RevisionCard
              key={item.id}
              item={item}
              onComplete={handleComplete}
              compact={compact}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-4">No revisions due right now. Great discipline!</p>
      )}
    </GlassCard>
  );
}

function Widget({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: typeof Calendar;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${bg} rounded-xl p-3 text-center border border-white/5`}
    >
      <Icon className={`mx-auto mb-1 ${color}`} size={18} />
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500 uppercase">{label}</p>
    </motion.div>
  );
}
