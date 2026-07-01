import { motion } from 'framer-motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { Roadmap2026 } from '@/types/roadmap2026';

interface RoadmapStickyHeaderProps {
  data: Roadmap2026;
  view: string;
}

export function RoadmapStickyHeader({ data, view }: RoadmapStickyHeaderProps) {
  const currentWeek = data.weeks.find((w) => w.is_current);

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="roadmap-sticky-header"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {data.exam_label}
          </p>
          <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            Jul 1 – Sep 5 Roadmap
          </h1>
          <p className="text-xs text-slate-500">
            Week {data.current_week} · {data.days_remaining} days left · {view}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {currentWeek && (
            <div className="hidden text-right sm:block">
              <p className="text-[10px] uppercase text-slate-500">This week</p>
              <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                {currentWeek.completion_pct}%
              </p>
            </div>
          )}
          <ProgressRing progress={data.overall_completion} size={56} strokeWidth={5} label="" />
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          animate={{ width: `${data.overall_completion}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.header>
  );
}
