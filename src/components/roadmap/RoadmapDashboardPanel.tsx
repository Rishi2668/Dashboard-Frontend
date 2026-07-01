import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Trophy,
} from 'lucide-react';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { Roadmap2026 } from '@/types/roadmap2026';
import { cn } from '@/lib/utils';

interface RoadmapDashboardPanelProps {
  data: Roadmap2026;
}

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof Target;
  accent: string;
}) {
  return (
    <div className="roadmap-stat-tile">
      <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', accent)}>
        <Icon size={16} />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}

export function RoadmapDashboardPanel({ data }: RoadmapDashboardPanelProps) {
  const subjects = Object.values(data.subject_progress);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Overall progress"
          value={`${data.overall_completion}%`}
          sub={`${data.overall_completed}/${data.overall_total} items`}
          icon={Target}
          accent="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatTile
          label="Current week"
          value={`Week ${data.current_week}`}
          sub={`${data.days_remaining} days to Sep 5`}
          icon={Calendar}
          accent="bg-blue-500/15 text-blue-600 dark:text-blue-400"
        />
        <StatTile
          label="Mocks completed"
          value={data.mocks_completed}
          icon={Trophy}
          accent="bg-amber-500/15 text-amber-600 dark:text-amber-400"
        />
        <StatTile
          label="Hours studied"
          value={data.hours_studied}
          sub={`${data.completion_streak} week streak`}
          icon={Clock}
          accent="bg-purple-500/15 text-purple-600 dark:text-purple-400"
        />
      </div>

      <div className="roadmap-card flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ProgressRing progress={data.overall_completion} size={120} label="Overall" />
        <div className="flex-1 w-full">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Phase progress</h3>
          <div className="space-y-3">
            {data.phases.map((phase) => (
              <div key={phase.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{phase.name}</span>
                  <span className="tabular-nums text-slate-500">{phase.completion_pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
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
                <p className="mt-0.5 text-[10px] text-slate-500">{phase.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <div key={s.label} className="roadmap-stat-tile">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.label}</p>
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{s.completion_pct}%</p>
            <p className="text-[10px] text-slate-500">
              {s.completed}/{s.total} topics
            </p>
          </div>
        ))}
      </div>

      <div className="roadmap-card">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <BookOpen size={16} className="text-blue-500" /> Daily schedule (Mon–Sat)
        </h3>
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          <p className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">GS</span> —{' '}
            {data.daily_schedule.gs_hours}h
          </p>
          <p className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
            <span className="font-medium text-purple-600 dark:text-purple-400">English + Vocab</span> —{' '}
            {data.daily_schedule.english_vocab_hours}h
          </p>
          <p className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/5">
            <span className="font-medium text-blue-600 dark:text-blue-400">Quant + Reasoning</span> —{' '}
            {data.daily_schedule.quant_reasoning_hours}h
          </p>
        </div>
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">{data.daily_schedule.sunday}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="roadmap-stat-tile text-center">
          <CheckCircle2 className="mx-auto mb-1 text-emerald-500" size={20} />
          <p className="text-lg font-bold">{data.counters.vocabulary}</p>
          <p className="text-[10px] text-slate-500">Vocab sessions</p>
        </div>
        <div className="roadmap-stat-tile text-center">
          <BarChart3 className="mx-auto mb-1 text-blue-500" size={20} />
          <p className="text-lg font-bold">{data.counters.formula_revision}</p>
          <p className="text-[10px] text-slate-500">Formula revision</p>
        </div>
        <div className="roadmap-stat-tile text-center">
          <Flame className="mx-auto mb-1 text-orange-500" size={20} />
          <p className="text-lg font-bold">{data.counters.pyq}</p>
          <p className="text-[10px] text-slate-500">PYQ done</p>
        </div>
      </div>
    </div>
  );
}
