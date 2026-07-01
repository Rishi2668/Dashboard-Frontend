import { motion } from 'framer-motion';
import type { RoadmapPhase } from '@/types/roadmap2026';
import { cn } from '@/lib/utils';

interface PhaseTimelineProps {
  phases: RoadmapPhase[];
  currentWeek: number;
  onSelectPhase?: (phaseId: number) => void;
}

export function PhaseTimeline({ phases, currentWeek, onSelectPhase }: PhaseTimelineProps) {
  const currentPhase = phases.find((p) => p.weeks.includes(currentWeek))?.id ?? 1;

  return (
    <div className="roadmap-card">
      <h3 className="mb-6 text-sm font-semibold text-slate-900 dark:text-white">Preparation phases</h3>
      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-white/10" />
        <div className="space-y-8">
          {phases.map((phase, i) => {
            const active = phase.id === currentPhase;
            const done = phase.completion_pct >= 100;
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-10"
              >
                <span
                  className={cn(
                    'absolute left-2.5 top-1 flex h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-white dark:ring-[#12121a]',
                    done && 'bg-emerald-500',
                    active && !done && 'bg-blue-500 animate-pulse',
                    !active && !done && 'bg-slate-300 dark:bg-slate-600'
                  )}
                />
                <button
                  type="button"
                  onClick={() => onSelectPhase?.(phase.id)}
                  className="w-full text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{phase.name}</p>
                      <p className="text-xs text-slate-500">{phase.subtitle}</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Weeks {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]}
                      </p>
                    </div>
                    <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                      {phase.completion_pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        phase.color === 'emerald' && 'bg-emerald-500',
                        phase.color === 'blue' && 'bg-blue-500',
                        phase.color === 'purple' && 'bg-purple-500'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${phase.completion_pct}%` }}
                    />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
