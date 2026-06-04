import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { SectionalTrendChart } from '@/components/mock/SectionalTrendChart';
import { buildTrendChartDataFromMocks } from '@/lib/mockTrendData';
import { Sparkles, Target as TargetIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TargetScorePanel } from '@/components/target/TargetScorePanel';
import { SectionalTargetPanel } from '@/components/mock/SectionalTargetPanel';
import { SectionalSubjectTrendCharts } from '@/components/mock/SectionalSubjectTrendCharts';
import {
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  Minus,
  Trash2,
  Brain,
  AlertTriangle,
} from 'lucide-react';
import type { MockAnalytics, MockTest } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { filterMocksByType, isSectionalShapedOverall } from '@/lib/mockClassification';
import { useMemo, type ReactNode } from 'react';

export interface MockAnalyticsViewProps {
  mode: 'full' | 'sectional';
  title: string;
  subtitle: string;
  analytics: MockAnalytics;
  mocks: MockTest[];
  showForm: boolean;
  onToggleForm: () => void;
  formSlot: ReactNode;
  onDelete: (id: number) => void;
}

function primarySectionLabel(m: MockTest): string {
  const sections = [
    { k: 'reasoning', s: m.reasoning },
    { k: 'quant', s: m.quant },
    { k: 'english', s: m.english },
    { k: 'gk', s: m.gk },
  ];
  const active = sections.reduce((best, cur) =>
    (cur.s.attempted ?? 0) > (best.s.attempted ?? 0) ? cur : best
  );
  const labels: Record<string, string> = {
    reasoning: 'Reasoning',
    quant: 'Quant',
    english: 'English',
    gk: 'GK',
  };
  return labels[active.k] ?? '—';
}

export function MockAnalyticsView({
  mode,
  title,
  subtitle,
  analytics,
  mocks,
  showForm,
  onToggleForm,
  formSlot,
  onDelete,
}: MockAnalyticsViewProps) {
  const isFull = mode === 'full';
  const displayMocks = useMemo(
    () => filterMocksByType(mocks, isFull ? 'full' : 'sectional'),
    [mocks, isFull]
  );
  const hasFullMocks = !isFull || displayMocks.length > 0;
  const showTargetPanel =
    isFull &&
    hasFullMocks &&
    analytics.target_analytics?.has_mock_data &&
    !isSectionalShapedOverall(analytics.target_analytics?.overall?.actual_max);

  const mockInsights = analytics.ai_insights ?? [];
  const targetInsights = hasFullMocks ? (analytics.target_insights ?? []) : [];
  const subjectTargets = analytics.subject_targets ?? [];
  const fullMockChartData = useMemo(
    () => (isFull ? buildTrendChartDataFromMocks(displayMocks) : []),
    [isFull, displayMocks]
  );
  const overallTarget = analytics.target_analytics?.overall?.target;

  const renderInsightCards = (items: typeof mockInsights, accent?: 'target' | 'mock' | 'sectional') => (
    <div className="grid sm:grid-cols-2 gap-2">
      {items.map((ins, i) => (
        <motion.div
          key={`${ins.title}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-3 rounded-xl text-sm border',
            ins.priority === 'high'
              ? 'bg-red-500/10 border-red-500/20'
              : accent === 'target'
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : accent === 'sectional'
                  ? 'bg-purple-500/10 border-purple-500/20'
                  : 'bg-white/5 border-white/10'
          )}
        >
          <p className="font-medium text-white">{ins.title}</p>
          <p className="text-slate-400 text-xs mt-1">{ins.message}</p>
        </motion.div>
      ))}
    </div>
  );

  const btnClass = isFull
    ? 'bg-gradient-to-r from-blue-600/80 to-blue-500/80'
    : 'bg-gradient-to-r from-purple-600/80 to-purple-500/80';

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onToggleForm}
          className={cn('px-4 py-2 text-white rounded-xl text-sm font-medium hover:opacity-90', btnClass)}
        >
          {showForm ? 'Close form' : isFull ? '+ Save Full Mock' : '+ Save Sectional'}
        </button>
      </div>

      <AnimatePresence>{showForm && formSlot}</AnimatePresence>

      {!isFull && subjectTargets.length > 0 && <SectionalTargetPanel subjects={subjectTargets} />}

      {!isFull && (
        <SectionalSubjectTrendCharts trends={analytics.subject_accuracy_trends} mocks={mocks} />
      )}

      {showTargetPanel && analytics.target_analytics && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <TargetScorePanel data={analytics.target_analytics} hideAiInsights hideWeeklyTrend />
        </motion.div>
      )}

      {isFull && hasFullMocks && mockInsights.length > 0 && (
        <GlassCard className="!p-4">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <Brain size={18} className="text-blue-400" />
            AI Full Mock Insights
          </h3>
          {renderInsightCards(mockInsights, 'mock')}
        </GlassCard>
      )}

      {isFull && hasFullMocks && targetInsights.length > 0 && (
        <GlassCard className="!p-4">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <Brain size={18} className="text-emerald-400" />
            AI Target Insights
          </h3>
          {renderInsightCards(targetInsights, 'target')}
        </GlassCard>
      )}

      {!isFull && mockInsights.length > 0 && (
        <GlassCard className="!p-4">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <Brain size={18} className="text-purple-400" />
            AI Sectional Insights
          </h3>
          {renderInsightCards(mockInsights, 'sectional')}
        </GlassCard>
      )}

      {hasFullMocks && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={isFull ? 'Latest score' : 'Latest sectional'}
          value={`${analytics.latest_score.toFixed(1)}`}
          icon={TrendingUp}
          color="blue"
          trend={
            analytics.improvement_delta != null
              ? `${analytics.improvement_delta >= 0 ? '+' : ''}${analytics.improvement_delta} vs prev`
              : undefined
          }
        />
        <StatCard label="Highest" value={analytics.highest_score.toFixed(0)} icon={Target} color="orange" />
        <StatCard label="Average" value={analytics.average_score.toFixed(0)} icon={TrendingUp} color="green" />
        <StatCard
          label="Latest %"
          value={`${analytics.latest_score_percentage}%`}
          icon={Target}
          color="purple"
          trend={`${analytics.average_accuracy.toFixed(1)}% avg accuracy`}
        />
      </div>
      )}

      {(analytics.weak_subjects?.length ?? 0) > 0 && hasFullMocks && (
        <GlassCard className="!p-4 flex flex-wrap items-center gap-3">
          <AlertTriangle className="text-amber-400 shrink-0" size={20} />
          <div>
            <p className="text-sm text-white font-medium">
              {isFull ? 'Weak sections (latest full mock)' : 'Sections needing work'}
            </p>
            <p className="text-xs text-slate-400">
              {analytics.weak_subjects.map((w) => `${w.subject} (${w.accuracy}%)`).join(' · ')}
            </p>
          </div>
          {analytics.strongest_subject && (
            <span className="ml-auto text-xs text-green-400">Strongest: {analytics.strongest_subject}</span>
          )}
        </GlassCard>
      )}

      {analytics.section_comparison.length > 0 && (!isFull || hasFullMocks) && (
        <div className="grid lg:grid-cols-4 gap-3">
          {analytics.section_comparison.map((s) => (
            <GlassCard key={s.subject} className="!p-4 flex flex-col items-center">
              <ProgressRing
                progress={s.accuracy}
                size={80}
                strokeWidth={6}
                centerText={`${s.accuracy}%`}
                label={s.subject}
              />
              <p className="text-sm text-white font-semibold mt-2">
                {s.score} / {s.max_marks ?? 50}
              </p>
              {!isFull && (s as { target_marks?: number }).target_marks != null && (
                <p className="text-xs text-purple-300">
                  Target {(s as { target_marks?: number }).target_marks} /{' '}
                  {(s as { target_max?: number }).target_max ?? 50}
                </p>
              )}
              <p className="text-[10px] text-slate-500">
                {isFull
                  ? `Attempted ${s.attempted ?? 0}/${s.total_questions ?? 25}`
                  : `${(s as { sectional_count?: number }).sectional_count ?? 0} sectionals`}
              </p>
            </GlassCard>
          ))}
        </div>
      )}

      {hasFullMocks && (
      <div className="grid lg:grid-cols-3 gap-2 text-center text-sm">
        <GlassCard className="!p-3 flex items-center gap-2 justify-center">
          <CheckCircle className="text-green-400" size={16} />
          <span>{analytics.total_correct} correct</span>
        </GlassCard>
        <GlassCard className="!p-3 flex items-center gap-2 justify-center">
          <XCircle className="text-red-400" size={16} />
          <span>{analytics.total_wrong} wrong</span>
        </GlassCard>
        <GlassCard className="!p-3 flex items-center gap-2 justify-center">
          <Minus className="text-orange-400" size={16} />
          <span>{analytics.total_negative.toFixed(1)} negative</span>
        </GlassCard>
      </div>
      )}

      {isFull && hasFullMocks && fullMockChartData.length > 0 && (
        <GlassCard className="!p-0 overflow-hidden border border-blue-500/25 shadow-xl shadow-blue-500/10">
          <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-transparent">
            <p className="text-[10px] uppercase tracking-widest text-blue-300/90 flex items-center gap-1.5">
              <Sparkles size={12} /> Performance timeline
            </p>
            <h3 className="text-lg font-bold text-white mt-0.5">Full mock trends</h3>
            {overallTarget != null && (
              <p className="text-xs text-blue-200 mt-1 flex items-center gap-1">
                <TargetIcon size={12} /> Target: {overallTarget} marks
              </p>
            )}
          </div>
          <div className="p-4 sm:p-5">
            <SectionalTrendChart
              data={fullMockChartData}
              height={380}
              marksColor="#3b82f6"
              targetMarks={overallTarget}
              showTargetLine={overallTarget != null}
              subjectLabel="Full mock"
            />
          </div>
        </GlassCard>
      )}

      {isFull && hasFullMocks && analytics.section_comparison.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-white mb-4">Section radar (latest mock)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={analytics.section_comparison}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar dataKey="accuracy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {isFull && analytics.total_mocks === 0 && displayMocks.length === 0 && (
        <GlassCard className="!p-8 text-center">
          <p className="text-slate-400 text-sm">No full mocks logged yet.</p>
          <p className="text-xs text-slate-500 mt-2">
            Sectional tests are tracked separately under Sectional Analytics and do not appear here.
          </p>
        </GlassCard>
      )}

      {displayMocks.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-white mb-3">
            Recent {isFull ? 'full mocks' : 'sectionals'} ({displayMocks.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-left">
                  <th className="pb-2">Date</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>{isFull ? 'Sections' : 'Subject'}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {displayMocks.slice(0, 10).map((m) => (
                  <tr key={m.id} className="border-t border-white/5 text-slate-300">
                    <td className="py-2">{format(new Date(m.test_date), 'MMM d, yyyy')}</td>
                    <td className="max-w-[140px] truncate">{m.test_name ?? '—'}</td>
                    <td className="font-bold text-white">
                      {m.total_score}/{m.max_score}
                    </td>
                    <td>{m.accuracy.toFixed(1)}%</td>
                    <td className="text-xs">
                      {isFull ? (
                        <>
                          R {m.reasoning.secured_marks} · Q {m.quant.secured_marks} · E {m.english.secured_marks}{' '}
                          · GK {m.gk.secured_marks}
                        </>
                      ) : (
                        primarySectionLabel(m)
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onDelete(m.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400"
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
      )}
    </div>
  );
}
