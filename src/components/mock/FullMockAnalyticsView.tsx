import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  BarChart3,
  Brain,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Trash2,
  ClipboardList,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TargetScorePanel } from '@/components/target/TargetScorePanel';
import { SectionalTrendChart } from '@/components/mock/SectionalTrendChart';
import { DeferredRender } from '@/components/perf/DeferredRender';
import { buildTrendChartDataFromMocks } from '@/lib/mockTrendData';
import type { MockAnalytics, MockTest } from '@/types';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const FULL_MOCK_COLOR = '#3b82f6';

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

  const overallTarget = analytics.target_analytics?.overall?.target;
  const chartData = useMemo(() => buildTrendChartDataFromMocks(mocks), [mocks]);

  return (
    <motion.div className="space-y-6 max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
            Log a 200-mark mock with Reasoning, Quant, English & GK to see your interactive performance
            timeline and target comparison.
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
          {/* Hero — interactive full mock trend (replaces score progression + accuracy + weekly) */}
          <DeferredRender minHeight={420}>
            <GlassCard className="!p-0 overflow-hidden border border-blue-500/25 shadow-xl shadow-blue-500/10">
              <div className="relative px-5 py-4 border-b border-white/10 bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-transparent">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-blue-300/90 flex items-center gap-1.5">
                      <Sparkles size={12} /> Performance timeline
                    </p>
                    <h2 className="text-xl font-bold text-white mt-0.5">Full mock trends</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {mocks.length} attempt{mocks.length !== 1 ? 's' : ''} · hover, click bars, or use chips below
                    </p>
                  </div>
                  {overallTarget != null && (
                    <span className="text-xs text-blue-200 flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 px-3 py-1.5 rounded-full">
                      <Target size={12} /> Overall target: {overallTarget} marks
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 sm:p-5">
                {chartData.length > 0 ? (
                  <SectionalTrendChart
                    data={chartData}
                    height={380}
                    marksColor={FULL_MOCK_COLOR}
                    targetMarks={overallTarget}
                    showTargetLine={overallTarget != null}
                    subjectLabel="Full mock"
                  />
                ) : (
                  <p className="text-sm text-slate-500 py-16 text-center">Add mocks to see your trend</p>
                )}
              </div>
            </GlassCard>
          </DeferredRender>

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
            <TargetScorePanel
              data={analytics.target_analytics}
              hideAiInsights
              hideWeeklyTrend
            />
          )}

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

          {(analytics.ai_insights?.length ?? 0) > 0 && (
            <DeferredRender minHeight={180}>
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
            </DeferredRender>
          )}

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
