import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { SectionalTrendChart } from '@/components/mock/SectionalTrendChart';
import { format } from 'date-fns';
import {
  Brain,
  Layers,
  Plus,
  Target,
  TrendingUp,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { DeferredRender } from '@/components/perf/DeferredRender';
import { MOCK_SUBJECTS } from '@/lib/mockCalculations';
import { filterMocksByType } from '@/lib/mockClassification';
import {
  compareSectionalMocks,
  getSectionalMarks,
  sectionalSubjectKey,
} from '@/lib/sectionalMarks';
import type { MockAnalytics, MockTest, SectionalSubjectTarget } from '@/types';
import type { SubjectKey } from '@/lib/mockCalculations';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const chartTooltipStyle = {
  background: '#1a1a24',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
};

const SUBJECT_COLORS: Record<SubjectKey, string> = {
  reasoning: '#a855f7',
  quant: '#3b82f6',
  english: '#22c55e',
  gk: '#f59e0b',
};

interface SectionalAnalyticsViewProps {
  analytics: MockAnalytics;
  mocks: MockTest[];
  showForm: boolean;
  onToggleForm: () => void;
  formSlot: ReactNode;
  onDelete: (id: number) => void;
}

export function SectionalAnalyticsView({
  analytics,
  mocks,
  showForm,
  onToggleForm,
  formSlot,
  onDelete,
}: SectionalAnalyticsViewProps) {
  const sectionalMocks = useMemo(() => filterMocksByType(mocks, 'sectional'), [mocks]);
  const targets = analytics.subject_targets ?? [];
  const targetMap = useMemo(
    () => Object.fromEntries(targets.map((t) => [t.key, t])) as Record<string, SectionalSubjectTarget>,
    [targets]
  );

  const [activeSubject, setActiveSubject] = useState<SubjectKey>('reasoning');

  const subjectMocks = useMemo(
    () =>
      sectionalMocks
        .filter((m) => sectionalSubjectKey(m) === activeSubject)
        .sort(compareSectionalMocks),
    [sectionalMocks, activeSubject]
  );

  const meta = MOCK_SUBJECTS.find((s) => s.key === activeSubject)!;
  const target = targetMap[activeSubject];
  const latest = subjectMocks[0];
  const latestMarks = latest ? getSectionalMarks(latest, activeSubject) : null;
  const latestScore = latestMarks?.secured ?? 0;
  const latestMax = latestMarks?.max ?? 50;

  /** Chart from saved mocks (not analytics cache) — one point per attempt, unique x labels. */
  const chartData = useMemo(() => {
    const chronological = [...subjectMocks].sort((a, b) => -compareSectionalMocks(a, b));
    return chronological.map((m, idx) => {
      const marks = getSectionalMarks(m, activeSubject);
      const shortDate = format(new Date(m.test_date), 'MMM d, yyyy');
      const title = m.test_name?.trim();
      return {
        id: m.id,
        date: m.test_date,
        label: title ? `${shortDate} (#${idx + 1} · ${title})` : `${shortDate} (#${idx + 1})`,
        score: marks.secured,
        accuracy: marks.accuracy,
        max_score: marks.max,
        name: title,
      };
    });
  }, [subjectMocks, activeSubject]);

  return (
    <motion.div className="space-y-6 max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-purple-400 uppercase tracking-widest flex items-center gap-1">
            <Layers size={14} /> Separate from full mocks
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">Sectional Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            One subject per entry · {sectionalMocks.length} sectional(s) logged
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleForm}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition',
            showForm
              ? 'bg-white/10 border border-white/20'
              : 'bg-gradient-to-r from-purple-600 to-violet-500 hover:opacity-90 shadow-lg shadow-purple-500/20'
          )}
        >
          <Plus size={18} className={showForm ? 'rotate-45 transition' : ''} />
          {showForm ? 'Close' : 'Add sectional'}
        </button>
      </div>

      <AnimatePresence>{showForm && <motion.div layout>{formSlot}</motion.div>}</AnimatePresence>

      {/* Subject tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {MOCK_SUBJECTS.map(({ key, short, color }) => {
          const t = targetMap[key];
          const count = sectionalMocks.filter((m) => sectionalSubjectKey(m) === key).length;
          const isActive = activeSubject === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSubject(key)}
              className={cn(
                'relative p-4 rounded-2xl border text-left transition-all duration-200',
                isActive
                  ? 'border-purple-500/60 bg-purple-500/15 scale-[1.02] shadow-lg shadow-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              )}
            >
              <p className={cn('text-sm font-semibold', isActive ? 'text-white' : 'text-slate-400')}>
                {short}
              </p>
              {t && (
                <p className="text-[10px] text-purple-300 mt-1">
                  Target {t.target}/{t.target_max}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-2">{count} sectional{count !== 1 ? 's' : ''}</p>
              {isActive && (
                <motion.div
                  layoutId="sectional-tab-indicator"
                  className="absolute bottom-0 left-3 right-3 h-0.5 bg-purple-400 rounded-full"
                />
              )}
              <span
                className={cn(
                  'absolute top-3 right-3 w-2 h-2 rounded-full',
                  color === 'purple' && 'bg-purple-400',
                  color === 'blue' && 'bg-blue-400',
                  color === 'green' && 'bg-green-400',
                  color === 'amber' && 'bg-amber-400'
                )}
              />
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubject}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Active subject hero */}
          <GlassCard className="!p-6 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at 20% 50%, ${SUBJECT_COLORS[activeSubject]}40, transparent 60%)`,
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
              <ProgressRing
                progress={target?.achievement_pct ?? (latest ? (latestScore / latestMax) * 100 : 0)}
                size={120}
                strokeWidth={8}
                centerText={target ? `${target.achievement_pct}%` : '—'}
                centerHint="of target"
                label={meta.label}
              />
              <div className="flex-1 space-y-3 w-full">
                <h2 className="text-xl font-bold text-white">{meta.label}</h2>
                {target ? (
                  <motion.div className="grid sm:grid-cols-3 gap-3">
                    <motion.div className="glass !p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase">Dashboard target</p>
                      <p className="text-lg font-bold text-purple-300">
                        {target.target} / {target.target_max}
                      </p>
                    </motion.div>
                    <motion.div className="glass !p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase">Latest sectional</p>
                      <p className="text-lg font-bold text-white">
                        {target.has_sectional_data ? `${target.actual} / ${target.actual_max}` : '—'}
                      </p>
                    </motion.div>
                    <motion.div className="glass !p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase">Gap to target</p>
                      <p
                        className={cn(
                          'text-lg font-bold',
                          target.gap <= 5 ? 'text-green-400' : 'text-orange-400'
                        )}
                      >
                        {target.has_sectional_data
                          ? `${target.gap} marks`
                          : 'Log a sectional'}
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <p className="text-sm text-slate-500">Set subject targets on the dashboard first.</p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Chart */}
          <DeferredRender minHeight={320}>
          <GlassCard className="!p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp size={18} style={{ color: SUBJECT_COLORS[activeSubject] }} />
                {meta.short} trend
              </h3>
              {target && (
                <span className="text-xs text-purple-300 flex items-center gap-1">
                  <Target size={12} /> Target line: {target.target} marks
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mb-3 -mt-2">
              Solid = marks (left). Dashed green = accuracy % (right). Legend at top of chart.
            </p>
            {chartData.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-500 text-sm">No {meta.short} sectionals yet</p>
                <button
                  type="button"
                  onClick={onToggleForm}
                  className="mt-3 text-purple-400 text-sm hover:underline"
                >
                  Add your first {meta.short} sectional
                </button>
              </div>
            ) : (
              <SectionalTrendChart
                data={chartData}
                height={300}
                marksColor={SUBJECT_COLORS[activeSubject]}
                targetMarks={target?.target}
                showTargetLine={!!target}
              />
            )}
          </GlassCard>
          </DeferredRender>

          {/* Compare all subjects bar */}
          {targets.length > 0 && (
            <DeferredRender minHeight={260}>
            <GlassCard className="!p-5">
              <h3 className="font-semibold text-white mb-4">All subjects: actual vs target</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={targets.map((t) => ({
                    name: MOCK_SUBJECTS.find((m) => m.key === t.key)?.short ?? t.key,
                    actual: t.actual,
                    target: t.target,
                    key: t.key,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar
                    dataKey="actual"
                    name="Latest actual"
                    fill={SUBJECT_COLORS[activeSubject]}
                    radius={[4, 4, 0, 0]}
                    onClick={(d) => {
                      const row = d as { key?: string };
                      if (row?.key) setActiveSubject(row.key as SubjectKey);
                    }}
                    cursor="pointer"
                  />
                  <Bar dataKey="target" name="Target" fill="#6b21a8" radius={[4, 4, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            </DeferredRender>
          )}

          {/* AI */}
          {(() => {
            const sectionalOnly = (analytics.ai_insights ?? []).filter(
              (i) =>
                i.category !== 'strategy' &&
                !i.message.toLowerCase().includes('latest mock') &&
                !i.title.toLowerCase().includes('overall target')
            );
            return sectionalOnly.length > 0 ? (
            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Brain size={18} className="text-purple-400" />
                AI sectional insights
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {sectionalOnly.map((ins, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    className="p-3 rounded-xl text-sm border bg-purple-500/10 border-purple-500/20"
                  >
                    <p className="font-medium text-white">{ins.title}</p>
                    <p className="text-slate-400 text-xs mt-1">{ins.message}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
            ) : null;
          })()}

          {/* History table */}
          <GlassCard className="!p-4">
            <h3 className="font-semibold text-white mb-3">
              {meta.short} sectionals ({subjectMocks.length})
            </h3>
            {subjectMocks.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No sectionals for {meta.short}. Use &quot;Add sectional&quot; above.
              </p>
            ) : (
              <div className="space-y-2">
                {subjectMocks.map((m) => {
                  const marks = getSectionalMarks(m, activeSubject);
                  const gap = target ? Math.max(0, target.target - marks.secured) : 0;
                  return (
                    <motion.div
                      key={m.id}
                      layout
                      className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition group"
                    >
                      <div className="min-w-[100px]">
                        <p className="text-xs text-slate-500">
                          {format(new Date(m.test_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm font-medium text-white truncate max-w-[160px]">
                          {m.test_name ?? `${meta.short} sectional`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">
                          {marks.secured}/{marks.max}
                        </span>
                        <span className="text-xs text-slate-400">{marks.accuracy?.toFixed(0)}% acc</span>
                      </div>
                      {target && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            gap <= 5 ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
                          )}
                        >
                          {gap <= 0 ? 'On target' : `${gap} to target`}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(m.id)}
                        className="ml-auto p-2 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={16} className="text-slate-600 hidden sm:block" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
