import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Flame,
  Award,
  Clock,
  Trash2,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { StudyHeatmap } from '@/components/charts/StudyHeatmap';
import { scoreTargetsApi, studyApi } from '@/api';
import { API_URL } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { apiError } from '@/lib/apiError';
import { ExamTargetsEditor } from '@/components/dashboard/ExamTargetsEditor';
import { ScoreTargetsEditor } from '@/components/dashboard/ScoreTargetsEditor';
import { TargetScorePanel } from '@/components/target/TargetScorePanel';
import { RevisionTracker } from '@/components/revision/RevisionTracker';
import { DeferredRender } from '@/components/perf/DeferredRender';
import type { DashboardStats } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface OutletContext {
  stats: DashboardStats | null;
  setStats: (s: DashboardStats) => void;
  refreshStats: () => void;
}

export function DashboardPage() {
  const { stats, setStats, refreshStats } = useOutletContext<OutletContext>();

  const { data: targetAnalytics } = useQuery({
    queryKey: ['target-analytics'],
    queryFn: async () => (await scoreTargetsApi.analytics()).data,
    staleTime: 2 * 60_000,
    enabled: !!stats,
  });

  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ['study-sessions-recent'],
    queryFn: async () => (await studyApi.sessions(7)).data,
    staleTime: 60_000,
    enabled: !!stats,
  });

  const canDeleteStudy = stats?.api_features?.study_session_delete === true;
  const [form, setForm] = useState({
    hours: '',
    topics: '',
    productivity: '70',
    notes: '',
    revision: false,
  });
  const [showLog, setShowLog] = useState(false);

  const logStudy = async () => {
    if (!form.hours) {
      toast.error('Enter study hours');
      return;
    }
    try {
      await studyApi.createSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: parseFloat(form.hours),
        topics_completed: form.topics,
        productivity_score: parseInt(form.productivity),
        notes: form.notes || undefined,
        revision_done: form.revision,
        tasks_completed: 1,
      });
      toast.success('Study session logged! +XP');
      setShowLog(false);
      setForm({ hours: '', topics: '', productivity: '70', notes: '', revision: false });
      await refetchSessions();
      await refreshStats();
    } catch {
      toast.error('Failed to log session');
    }
  };

  const deleteStudy = async (id: number) => {
    if (!window.confirm('Delete this study session?')) return;
    try {
      const fresh = sessions;
      if (!fresh.some((s) => s.id === id)) {
        toast.error('This session is no longer in your list. Refreshing…');
        await refetchSessions();
        return;
      }
      await studyApi.deleteSession(id);
      await refetchSessions();
      await refreshStats();
      toast.success('Study session deleted');
    } catch (err) {
      const msg = apiError(err, 'Failed to delete session');
      if (msg === 'Not Found' || msg.includes('Not Found')) {
        toast.error(
          'Delete API is not live on Railway yet. Redeploy the backend, then open /health and confirm study_session_delete is true.'
        );
      } else {
        toast.error(msg);
      }
      await refetchSessions();
    }
  };

  if (!stats) return <DashboardSkeleton />;

  const user = stats.user;

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-orange-500/10" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-400 uppercase tracking-widest">SSC CGL {user.target_year}</p>
              <h1 className="text-3xl font-bold text-white mt-1">
                {user.name.split(' ')[0]}'s Command Center
              </h1>
              <ExamTargetsEditor stats={stats} onUpdated={setStats} />
              <ScoreTargetsEditor stats={stats} onUpdated={setStats} />
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">XP level progress</p>
              <ProgressRing
                progress={stats.level_progress}
                centerText={`${Math.round(stats.level_progress)}%`}
                centerHint={`${stats.xp} / ${stats.xp_for_next ?? 500} XP`}
                size={110}
              />
              <p className="text-xs text-slate-400 text-center">
                {stats.level} → {stats.next_level}
              </p>
              {stats.xp > 0 && stats.xp_breakdown && (
                <div className="w-full text-[10px] text-slate-500 space-y-0.5 border-t border-white/10 pt-2">
                  <p className="text-slate-400 uppercase tracking-wider mb-1">XP from</p>
                  {(
                    [
                      ['Calc practice', stats.xp_breakdown.calc_practice],
                      ['Syllabus', stats.xp_breakdown.syllabus],
                      ['Study logs', stats.xp_breakdown.study_sessions],
                      ['Full mocks', stats.xp_breakdown.mock_tests],
                      ['Sectionals', stats.xp_breakdown.sectional_tests ?? 0],
                      ['Notes', stats.xp_breakdown.notes],
                      ['Revision', stats.xp_breakdown.revision],
                    ] as const
                  )
                    .filter(([, v]) => v > 0)
                    .map(([label, v]) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span>{label}</span>
                        <span className="text-slate-300">+{v}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Mock"
          value={user.current_mock_score > 0 ? user.current_mock_score.toFixed(0) : '—'}
          icon={TrendingUp}
          color="blue"
          delay={0.1}
        />
        <StatCard label="Best Score" value={user.best_score.toFixed(0)} icon={Trophy} color="orange" delay={0.15} />
        <StatCard label="Accuracy" value={`${user.overall_accuracy.toFixed(1)}%`} icon={Target} color="green" delay={0.2} />
        <StatCard label="Days Left" value={stats.days_left} icon={Calendar} color="purple" trend="Until exam" delay={0.25} />
        <StatCard label="Study Streak" value={`${stats.study_streak}🔥`} icon={Flame} color="orange" delay={0.3} />
        <StatCard label="Today Hours" value={`${stats.today_hours.toFixed(1)}h`} icon={Clock} color="blue" delay={0.35} />
        <StatCard label="Week Hours" value={`${stats.week_hours.toFixed(1)}h`} icon={BookOpen} color="green" delay={0.4} />
        <StatCard label="Consistency" value={`${stats.month_consistency}%`} icon={Award} color="purple" delay={0.45} />
      </div>

      {targetAnalytics && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <TargetScorePanel data={targetAnalytics} simple />
        </motion.div>
      )}

      <DeferredRender minHeight={200}>
        <RevisionTracker onComplete={refreshStats} />
      </DeferredRender>

      <motion.div className="grid lg:grid-cols-2 gap-6 perf-content-auto">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Daily Study Tracker</h3>
            <button
              onClick={() => setShowLog(!showLog)}
              className="text-sm px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
            >
              + Log Session
            </button>
          </div>

          {showLog && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3 mb-4 p-4 bg-white/5 rounded-xl"
            >
              <input
                type="number"
                placeholder="Hours studied"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              />
              <input
                placeholder="Topics completed (comma separated)"
                value={form.topics}
                onChange={(e) => setForm({ ...form, topics: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={form.productivity}
                onChange={(e) => setForm({ ...form, productivity: e.target.value })}
                className="w-full accent-blue-500"
              />
              <p className="text-xs text-slate-400">Productivity: {form.productivity}%</p>
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={form.revision}
                  onChange={(e) => setForm({ ...form, revision: e.target.checked })}
                />
                Revision completed
              </label>
              <button onClick={logStudy} className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                Save Session
              </button>
            </motion.div>
          )}

          {stats?.api_features && !canDeleteStudy && (
            <p className="text-xs text-amber-400/90 mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              Delete is unavailable on the API this app is using. Current API:{' '}
              <code className="text-amber-200 break-all">{API_URL}</code>. If you deployed on Render,
              set Vercel <code className="text-amber-200">VITE_API_URL</code> to your Render URL +{' '}
              <code className="text-amber-200">/api/v1</code>, redeploy frontend, then hard refresh.
            </p>
          )}

          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500">No sessions logged yet. Start your streak!</p>
            ) : (
              sessions.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                >
                  <motion.div>
                    <p className="text-sm font-medium text-white">{s.topics_completed || 'Study session'}</p>
                    <p className="text-xs text-slate-500">{format(new Date(s.date), 'MMM d')}</p>
                  </motion.div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-sm font-bold text-blue-400">{s.hours}h</p>
                      <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${s.productivity_score}%` }}
                        />
                      </div>
                    </div>
                    {canDeleteStudy && (
                      <button
                        onClick={() => void deleteStudy(s.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        aria-label="Delete session"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-white mb-4">Study Consistency Heatmap</h3>
          <DeferredRender minHeight={120}>
            <StudyHeatmap data={stats.heatmap_data} />
          </DeferredRender>
        </GlassCard>
      </motion.div>

      {stats.achievements.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-white mb-3">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {stats.achievements.map((a) => (
              <span key={a.id} className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs text-orange-300">
                🏅 {a.title}
              </span>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
