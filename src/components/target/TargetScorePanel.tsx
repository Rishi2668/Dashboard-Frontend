import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { TargetAnalytics } from '@/types/targetScore';
import { cn } from '@/lib/utils';

const chartTooltipStyle = {
  background: '#1a1a24',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
};

interface TargetScorePanelProps {
  data: TargetAnalytics;
  compact?: boolean;
  /** Hide AI block when insights are shown in mock analytics combined section */
  hideAiInsights?: boolean;
}

export function TargetScorePanel({ data, compact, hideAiInsights }: TargetScorePanelProps) {
  const { overall, subjects, ai_insights } = data;
  const subjectChartData = subjects.map((s) => ({
    name: s.label.split(' ')[0],
    actual: s.actual,
    target: s.target,
    gap: s.gap,
  }));
  const weeklyTrend = data.weekly_trend ?? [];

  return (
    <div className="space-y-4">
      <GlassCard className="!p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-blue-600/5" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="text-emerald-400" size={20} />
                Target score tracker
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {data.has_mock_data
                  ? `Based on latest mock${data.latest_mock_date ? ` (${data.latest_mock_date})` : ''}`
                  : 'Log a mock to compare actual vs target'}
              </p>
            </div>
            <ProgressRing
              progress={overall.target_progress_pct}
              size={compact ? 88 : 100}
              centerText={`${overall.achievement_pct}%`}
              centerHint="of target"
              label={`${overall.actual} / ${overall.target}`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Actual score', value: `${overall.actual} / ${overall.actual_max}`, color: 'text-white' },
              { label: 'Target score', value: `${overall.target} / ${overall.target_max}`, color: 'text-emerald-400' },
              { label: 'Gap remaining', value: `${overall.gap} marks`, color: 'text-orange-400' },
              { label: 'Goal probability', value: `${data.goal_achievement_probability}%`, color: 'text-blue-400' },
            ].map((item) => (
              <div key={item.label} className="glass !p-3 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase">{item.label}</p>
                <p className={cn('text-lg font-bold mt-1', item.color)}>{item.value}</p>
              </div>
            ))}
          </div>

          {data.score_prediction != null && (
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
              <TrendingUp size={14} className="text-blue-400" />
              Predicted next mock: ~{data.score_prediction} marks
              {data.monthly_improvement != null && (
                <span className={data.monthly_improvement >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ({data.monthly_improvement >= 0 ? '+' : ''}
                  {data.monthly_improvement} monthly trend)
                </span>
              )}
            </p>
          )}
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-4">
        {subjects.map((s) => (
          <GlassCard key={s.key} className="!p-4 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start gap-2 mb-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white leading-tight">{s.label}</p>
                <p className="text-lg font-bold text-white mt-1">
                  {s.actual} / {s.actual_max}
                </p>
                <p className="text-xs text-emerald-400">
                  Target: {s.target} / {s.target_max}
                </p>
              </div>
              <ProgressRing
                progress={s.target_progress_pct}
                size={64}
                strokeWidth={5}
                centerText={`${s.gap}`}
                centerHint="gap"
              />
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(s.target_progress_pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{s.achievement_pct}% of target</span>
              <span className="text-orange-400">{s.gap} marks to go</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {(weeklyTrend.length > 0 || subjectChartData.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-4">
          {weeklyTrend.length > 0 && (
            <GlassCard>
              <h4 className="text-sm font-semibold text-white mb-3">Weekly target tracking</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="avg_score" name="Avg score" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          )}
          {subjectChartData.length > 0 && (
            <GlassCard>
              <h4 className="text-sm font-semibold text-white mb-3">Actual vs target (subjects)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          )}
        </div>
      )}

      {!hideAiInsights && ai_insights.length > 0 && (
        <GlassCard className="!p-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-purple-400" />
            AI target insights
          </h4>
          <div className="space-y-2">
            {ai_insights.map((ins, i) => (
              <div
                key={i}
                className={cn(
                  'p-3 rounded-xl text-sm border',
                  ins.priority === 'high' ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'
                )}
              >
                <p className="font-medium text-white">{ins.title}</p>
                <p className="text-xs text-slate-400 mt-1">{ins.message}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
