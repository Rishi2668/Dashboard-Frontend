import { CalendarDays, Clock, ListChecks, Target, Trophy } from 'lucide-react';
import type { Roadmap2026 } from '@/types/roadmap2026';

interface RoadmapSummaryProps {
  data: Roadmap2026;
}

const STATS = [
  { key: 'week', label: 'This week', icon: Target },
  { key: 'mocks', label: 'Mocks', icon: Trophy },
  { key: 'hours', label: 'Hours', icon: Clock },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
] as const;

export function RoadmapSummary({ data }: RoadmapSummaryProps) {
  const current = data.weeks.find((w) => w.is_current);
  const values: Record<string, string> = {
    week: `${current?.completion_pct ?? 0}%`,
    mocks: String(data.mocks_completed),
    hours: `${data.hours_studied}h`,
    tasks: `${data.overall_completed}/${data.overall_total}`,
  };

  return (
    <div className="roadmap-summary-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="roadmap-eyebrow">Preparation plan</p>
          <h1 className="mt-1 text-[1.35rem] font-semibold tracking-tight text-slate-900 dark:text-white">
            SSC CGL 2026
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays size={14} className="shrink-0 text-emerald-500" />
            Jul 1 – Sep 5 · Week {data.current_week} · {data.days_remaining} days left
          </p>
        </div>
        <div className="roadmap-overall-badge">
          <p className="text-2xl font-bold tabular-nums leading-none text-emerald-600 dark:text-emerald-400">
            {data.overall_completion}%
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">overall</p>
        </div>
      </div>

      <div className="roadmap-progress-track mt-5">
        <div className="roadmap-progress-fill" style={{ width: `${data.overall_completion}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="roadmap-stat-pill">
            <Icon size={13} className="mb-1.5 text-emerald-500/80" />
            <p className="text-[10px] font-medium text-slate-500">{label}</p>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
              {values[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
