import { useCallback, useEffect, useState } from 'react';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MockTestForm, type MockTestFormPayload } from '@/components/mock/MockTestForm';
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
import { mockApi } from '@/api';
import { TargetScorePanel } from '@/components/target/TargetScorePanel';
import type { MockAnalytics, MockTest } from '@/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useOutletContext } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutContext {
  refreshStats?: () => void;
}

const chartTooltipStyle = {
  background: '#1a1a24',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
};

function toSectionPayload(s: MockTestFormPayload['reasoning']) {
  return {
    max_marks: s.max_marks,
    secured_marks: s.secured_marks,
    total_questions: s.total_questions,
    attempted: s.attempted,
    correct: s.correct,
    wrong: s.wrong,
  };
}

export function AnalyticsPage() {
  const { refreshStats } = useOutletContext<LayoutContext>();
  const [analytics, setAnalytics] = useState<MockAnalytics | null>(null);
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([mockApi.analytics(), mockApi.list()])
      .then(([a, m]) => {
        setAnalytics(a.data);
        setMocks(m.data);
      })
      .catch(() => toast.error('Failed to load mock analytics'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitMock = async (payload: MockTestFormPayload) => {
    setSaving(true);
    try {
      await mockApi.create({
        test_name: payload.test_name,
        test_date: payload.test_date,
        test_type: payload.test_type,
        max_score: payload.max_score,
        total_score: payload.total_score,
        total_questions: payload.total_questions,
        attempted: payload.attempted,
        correct: payload.correct,
        wrong: payload.wrong,
        negative_marks: payload.negative_marks,
        reasoning: toSectionPayload(payload.reasoning),
        quant: toSectionPayload(payload.quant),
        english: toSectionPayload(payload.english),
        gk: toSectionPayload(payload.gk),
      });
      toast.success('Mock test saved!');
      setShowForm(false);
      load();
      refreshStats?.();
    } catch {
      toast.error('Failed to save mock');
    } finally {
      setSaving(false);
    }
  };

  const deleteMock = async (id: number) => {
    if (!window.confirm('Delete this mock test record?')) return;
    try {
      await mockApi.delete(id);
      toast.success('Mock deleted');
      load();
      refreshStats?.();
    } catch {
      toast.error('Could not delete mock');
    }
  };

  if (loading && !analytics) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl max-w-6xl" />;
  }

  if (!analytics) {
    return (
      <GlassCard className="!p-8 text-center max-w-6xl">
        <p className="text-slate-400">Could not load analytics.</p>
        <button type="button" onClick={load} className="mt-3 text-blue-400 text-sm">
          Retry
        </button>
      </GlassCard>
    );
  }

  const insights = analytics.ai_insights ?? [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Mock Test Analytics</h1>
          <p className="text-sm text-slate-400">SSC CGL full & sectional mock tracking</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-blue-500/80 text-white rounded-xl text-sm font-medium hover:opacity-90"
        >
          {showForm ? 'Close form' : '+ Save Mock Test'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <MockTestForm onSubmit={submitMock} onCancel={() => setShowForm(false)} saving={saving} />
        )}
      </AnimatePresence>

      {analytics.target_analytics && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <TargetScorePanel data={analytics.target_analytics} hideAiInsights />
        </motion.div>
      )}

      {insights.length > 0 && (
        <GlassCard className="!p-4">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <Brain size={18} className="text-purple-400" />
            AI Mock & Target Insights
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'p-3 rounded-xl text-sm border',
                  ins.priority === 'high'
                    ? 'bg-red-500/10 border-red-500/20'
                    : ins.category === 'target' || ins.category === 'overall'
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-white/5 border-white/10'
                )}
              >
                <p className="font-medium text-white">{ins.title}</p>
                <p className="text-slate-400 text-xs mt-1">{ins.message}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Latest score"
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

      {(analytics.weak_subjects?.length ?? 0) > 0 && (
        <GlassCard className="!p-4 flex flex-wrap items-center gap-3">
          <AlertTriangle className="text-amber-400 shrink-0" size={20} />
          <div>
            <p className="text-sm text-white font-medium">Weak sections (latest mock)</p>
            <p className="text-xs text-slate-400">
              {analytics.weak_subjects.map((w) => `${w.subject} (${w.accuracy}%)`).join(' · ')}
            </p>
          </div>
          {analytics.strongest_subject && (
            <span className="ml-auto text-xs text-green-400">Strongest: {analytics.strongest_subject}</span>
          )}
        </GlassCard>
      )}

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
            <p className="text-[10px] text-slate-500">
              Attempted {s.attempted ?? 0}/{s.total_questions ?? 25}
            </p>
          </GlassCard>
        ))}
      </div>

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

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-semibold text-white mb-4">Score progression</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.score_progression}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-white mb-4">Accuracy trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.accuracy_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-white mb-4">Subject comparison (latest)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.section_comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Bar dataKey="score" name="Marks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="accuracy" name="Accuracy %" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-white mb-4">Section radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={analytics.section_comparison}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar dataKey="accuracy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {mocks.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-white mb-3">Recent mocks ({analytics.total_mocks})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-left">
                  <th className="pb-2">Date</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Sections</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {mocks.slice(0, 10).map((m) => (
                  <tr key={m.id} className="border-t border-white/5 text-slate-300">
                    <td className="py-2">{format(new Date(m.test_date), 'MMM d, yyyy')}</td>
                    <td className="max-w-[140px] truncate">{m.test_name ?? '—'}</td>
                    <td className="capitalize text-xs">{m.test_type}</td>
                    <td className="font-bold text-white">
                      {m.total_score}/{m.max_score}
                    </td>
                    <td>{m.accuracy.toFixed(1)}%</td>
                    <td className="text-xs">
                      R {m.reasoning.secured_marks} · Q {m.quant.secured_marks} · E {m.english.secured_marks} · GK{' '}
                      {m.gk.secured_marks}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => deleteMock(m.id)}
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
