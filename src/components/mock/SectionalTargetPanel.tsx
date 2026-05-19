import { Target } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { SectionalSubjectTarget } from '@/types';
import { cn } from '@/lib/utils';

interface SectionalTargetPanelProps {
  subjects: SectionalSubjectTarget[];
}

export function SectionalTargetPanel({ subjects }: SectionalTargetPanelProps) {
  if (!subjects.length) return null;

  return (
    <GlassCard className="!p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/5" />
      <div className="relative z-10 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="text-purple-400" size={20} />
          Sectional targets (from dashboard)
        </h3>
        <p className="text-xs text-slate-500">
          Compare each subject&apos;s latest sectional vs the target marks you set on the dashboard — e.g.
          Reasoning 45/50, Quant 48/50.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {subjects.map((s) => (
            <GlassCard key={s.key} className="!p-4 hover:border-purple-500/30 transition-colors">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white leading-tight">{s.label}</p>
                  <p className="text-xs text-purple-300 mt-2">
                    Target: <span className="font-bold">{s.target}</span> / {s.target_max} marks
                  </p>
                  {s.has_sectional_data ? (
                    <>
                      <p className="text-lg font-bold text-white mt-1">
                        Actual: {s.actual} / {s.actual_max}
                      </p>
                      <p className={cn('text-xs mt-1', s.gap <= 5 ? 'text-green-400' : 'text-orange-400')}>
                        {s.gap <= 0 ? 'Target met in latest sectional' : `${s.gap} marks to target`}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">{s.sectional_count} sectional(s) logged</p>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2">No sectional logged yet for this subject</p>
                  )}
                </div>
                <ProgressRing
                  progress={s.has_sectional_data ? s.achievement_pct : 0}
                  size={64}
                  strokeWidth={5}
                  centerText={s.has_sectional_data ? `${s.achievement_pct}%` : '—'}
                  centerHint="of target"
                />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
