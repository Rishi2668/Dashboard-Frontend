import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import type { TargetAnalytics } from '@/types/targetScore';
import { SUBJECT_TARGET_FIELDS } from '@/types/targetScore';
import { cn } from '@/lib/utils';

interface TargetScorePanelProps {
  data: TargetAnalytics;
  /** Clean layout: no charts, rings, or extra stats (default). */
  simple?: boolean;
  hideAiInsights?: boolean;
  hideWeeklyTrend?: boolean;
  /** @deprecated Use simple={false} */
  compact?: boolean;
}

const SUBJECT_SHORT: Record<string, string> = {
  reasoning: 'Reasoning',
  quant: 'Quant',
  english: 'English',
  gk: 'GK',
};

function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('h-2 rounded-full bg-white/10 overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SimpleTargetPanel({ data }: { data: TargetAnalytics }) {
  const { overall, subjects, has_mock_data } = data;
  const overallPct = has_mock_data ? overall.achievement_pct : 0;
  const gapText =
    overall.gap <= 0
      ? 'Target reached'
      : has_mock_data
        ? `${overall.gap} marks to go`
        : `Goal: ${overall.target} marks`;

  const subjectByKey = Object.fromEntries(subjects.map((s) => [s.key, s]));

  return (
    <GlassCard className="!p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Target className="text-emerald-400" size={18} />
            Exam score targets
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            {has_mock_data
              ? `Latest full mock${data.latest_mock_date ? ` · ${data.latest_mock_date}` : ''}`
              : 'Log a full mock in Analytics to see how close you are to your targets.'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Overall</p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {has_mock_data ? overall.actual : '—'}
            <span className="text-base font-normal text-slate-500">
              {' '}
              / {overall.target}
            </span>
          </p>
          <p
            className={cn(
              'text-xs mt-0.5',
              overall.gap <= 0 && has_mock_data ? 'text-emerald-400' : 'text-slate-400'
            )}
          >
            {gapText}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
          <span>Progress toward overall target</span>
          <span className="text-slate-300 tabular-nums">{overallPct}%</span>
        </div>
        <ProgressBar value={overallPct} />
      </div>

      <div className="space-y-3">
        {SUBJECT_TARGET_FIELDS.map(({ key, short }) => {
          const s = subjectByKey[key];
          if (!s) return null;
          const pct = has_mock_data ? s.achievement_pct : 0;
          const hasActual = has_mock_data && s.actual > 0;
          return (
            <div key={key} className="rounded-xl bg-white/[0.04] border border-white/5 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-medium text-slate-200">
                  {SUBJECT_SHORT[key] ?? short}
                </span>
                <span className="text-sm tabular-nums text-white">
                  {hasActual ? (
                    <>
                      {s.actual}
                      <span className="text-slate-500"> / {s.target}</span>
                    </>
                  ) : (
                    <span className="text-slate-500">Target {s.target}</span>
                  )}
                </span>
              </div>
              <ProgressBar value={pct} />
              {has_mock_data && s.gap > 0 && (
                <p className="text-[10px] text-slate-500 mt-1">{s.gap} marks short</p>
              )}
              {has_mock_data && s.gap <= 0 && s.actual > 0 && (
                <p className="text-[10px] text-emerald-400/90 mt-1">On target</p>
              )}
            </div>
          );
        })}
      </div>

      {!has_mock_data && (
        <Link
          to="/analytics"
          className="mt-4 inline-flex text-xs text-blue-400 hover:text-blue-300 hover:underline"
        >
          Go to Full Mock Analytics →
        </Link>
      )}
    </GlassCard>
  );
}

export function TargetScorePanel({ data }: TargetScorePanelProps) {
  return <SimpleTargetPanel data={data} />;
}
