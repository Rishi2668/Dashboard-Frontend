import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import {
  BarChart3,
  Brain,
  Plus,
  Target,
  TrendingUp,
  Trash2,
  ClipboardList,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TargetScorePanel } from '@/components/target/TargetScorePanel';
import type { MockAnalytics, MockTest } from '@/types';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const chartTooltipStyle = {
  background: '#1a1a24',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
};

interface FullMockAnalyticsViewProps {
  analytics: MockAnalytics;
  mocks: MockTest[];
  showForm: boolean;
  onToggleForm: () => void;
  formSlot: ReactNode;
  onDelete: (id: number) => void;
}

export function FullMockAnalyticsView({
  analytics,
  mocks,
  showForm,
  onToggleForm,
  formSlot,
  onDelete,
}: FullMockAnalyticsViewProps) {
  const hasMocks = mocks.length > 0;
  const showTarget =
    hasMocks &&
    analytics.target_analytics?.has_mock_data &&
    (analytics.target_analytics.overall.actual_max ?? 0) >= 100;

  return (
    <motion.div className="space-y-6 max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <motion.div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 size={14} /> SSC CGL · 200 marks
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">Full Mock Analytics</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Track complete mock tests with all four sections. Sectionals are saved separately.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleForm}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition shadow-lg',
            showForm
              ? 'bg-white/10 border border-white/20'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 shadow-blue-500/25'
          )}
        >
          <Plus size={18} className={cn('transition', showForm && 'rotate-45')} />
          {showForm ? 'Close' : 'Add full mock'}
        </button>
      </motion.div>

      <AnimatePresence>{showForm && <motion.div layout>{formSlot}</motion.div>}</AnimatePresence>

      {!hasMocks ? (
        <GlassCard className="!p-10 text-center border border-dashed border-white/15">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/15 flex items-center justify-center mb-4">
            <ClipboardList className="text-blue-400" size={32} />
          </div>
          <h2 className="text-lg font-semibold text-white">No full mocks yet</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Log a 200-mark mock with Reasoning, Quant, English & GK to see score trends, section
            breakdown, and target comparison.
          </p>
          <button
            type="button"
            onClick={onToggleForm}
            className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          >
            Log your first full mock
          </button>
          <p className="text-xs text-slate-500 mt-4">
            For single-subject practice → use Sectional Analytics in the sidebar
          </p>
        </GlassCard>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Latest score"
              value={`${analytics.latest_score.toFixed(0)}`}
              icon={TrendingUp}
              color="blue"
              trend={
                analytics.improvement_delta != null
                  ? `${analytics.improvement_delta >= 0 ? '+' : ''}${analytics.improvement_delta} vs prev`
                  : undefined
              }
            />
            <StatCard
              label="Highest"
              value={analytics.highest_score.toFixed(0)}
              icon={Target}
              color="orange"
            />
            <StatCard
              label="Average"
              value={analytics.average_score.toFixed(0)}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label="Latest accuracy"
              value={`${analytics.latest_score_percentage}%`}
              icon={Target}
              color="purple"
              trend={`${analytics.average_accuracy.toFixed(1)}% avg`}
            />
          </div>

          {showTarget && analytics.target_analytics && (
            <TargetScorePanel data={analytics.target_analytics} hideAiInsights />
          )}

          {/* Section breakdown */}
          {analytics.section_comparison.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Latest mock — section breakdown</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {analytics.section_comparison.map((s) => (
                  <GlassCard key={s.subject} className="!p-4 flex flex-col items-center">
                    <ProgressRing
                      progress={s.accuracy}
                      size={72}
                      strokeWidth={6}
                      centerText={`${s.accuracy}%`}
                      label={s.subject.split(' ')[0]}
                    />
                    <p className="text-sm font-bold text-white mt-2">
                      {s.score} / {s.max_marks ?? 50}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {s.attempted ?? 0}/{s.total_questions ?? 25} attempted
                    </p>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4">
            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white mb-3">Score progression</h3>
              {analytics.score_progression.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.score_progression}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 py-12 text-center">Add more mocks to see trends</p>
              )}
            </GlassCard>

            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white mb-3">Accuracy trend</h3>
              {analytics.accuracy_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.accuracy_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 py-12 text-center">Add more mocks to see trends</p>
              )}
            </GlassCard>

            {analytics.section_comparison.length > 0 && (
              <GlassCard className="!p-4 lg:col-span-2">
                <h3 className="font-semibold text-white mb-3">Subject marks (latest mock)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.section_comparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                    <Bar dataKey="score" name="Marks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            )}
          </div>

          {/* AI */}
          {(analytics.ai_insights?.length ?? 0) > 0 && (
            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Brain size={18} className="text-blue-400" />
                Insights
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {analytics.ai_insights.map((ins, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl text-sm border bg-white/5 border-white/10"
                  >
                    <p className="font-medium text-white">{ins.title}</p>
                    <p className="text-slate-400 text-xs mt-1">{ins.message}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* History */}
          <GlassCard className="!p-4">
            <h3 className="font-semibold text-white mb-3">Mock history ({mocks.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-left border-b border-white/10">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Score</th>
                    <th className="pb-2 pr-4">Accuracy</th>
                    <th className="pb-2">Sections</th>
                    <th className="pb-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {mocks.map((m) => (
                    <tr key={m.id} className="border-t border-white/5 text-slate-300">
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {format(new Date(m.test_date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 pr-4 max-w-[140px] truncate">{m.test_name ?? '—'}</td>
                      <td className="py-3 pr-4 font-bold text-white whitespace-nowrap">
                        {m.total_score}/{m.max_score}
                      </td>
                      <td className="py-3 pr-4">{m.accuracy.toFixed(1)}%</td>
                      <td className="py-3 text-xs">
                        R {m.reasoning.secured_marks} · Q {m.quant.secured_marks} · E{' '}
                        {m.english.secured_marks} · GK {m.gk.secured_marks}
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => onDelete(m.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </motion.div>
  );
}
