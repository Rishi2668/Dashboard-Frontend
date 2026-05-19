import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, BarChart3, Brain, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { calcPracticeApi } from '@/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { PracticeSetup } from '@/components/calc/PracticeSetup';
import { PracticeArena } from '@/components/calc/PracticeArena';
import { ConfettiBurst } from '@/components/calc/ConfettiBurst';
import type {
  CalcAnalytics,
  CalcAIInsight,
  CalcAttemptResult,
  CalcDifficulty,
  CalcMode,
  CalcQuestion,
  CalcSession,
  CalcSessionEnd,
} from '@/types/calcPractice';
import { MODE_INFO } from '@/types/calcPractice';
import { cn } from '@/lib/utils';

type Phase = 'setup' | 'practice' | 'summary';

export function CalcTrainerPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [tab, setTab] = useState<'practice' | 'analytics'>('practice');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['mixed']);
  const [difficulty, setDifficulty] = useState<CalcDifficulty>('medium');
  const [mode, setMode] = useState<CalcMode>('warmup');
  const [session, setSession] = useState<CalcSession | null>(null);
  const [question, setQuestion] = useState<CalcQuestion | null>(null);
  const [fingerprints, setFingerprints] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'skipped'>('idle');
  const [explanation, setExplanation] = useState('');
  const [displayAnswer, setDisplayAnswer] = useState('');
  const [correctStreak, setCorrectStreak] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<CalcAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [insights, setInsights] = useState<CalcAIInsight[]>([]);
  const [summary, setSummary] = useState<CalcSessionEnd | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [questionElapsedMs, setQuestionElapsedMs] = useState(0);

  const questionStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endingRef = useRef(false);

  const apiError = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ');
    }
    return fallback;
  };

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const [aRes, iRes] = await Promise.all([
        calcPracticeApi.analytics(),
        calcPracticeApi.aiInsights(),
      ]);
      setAnalytics(aRes.data);
      setInsights(iRes.data);
    } catch (err) {
      setAnalyticsError(apiError(err, 'Could not load calc analytics'));
      toast.error('Calc analytics failed to load');
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const toggleType = (type: string) => {
    if (type === 'mixed') {
      setSelectedTypes(['mixed']);
      return;
    }
    setSelectedTypes((prev) => {
      const withoutMixed = prev.filter((t) => t !== 'mixed');
      if (withoutMixed.includes(type)) {
        const next = withoutMixed.filter((t) => t !== type);
        return next.length ? next : ['mixed'];
      }
      return [...withoutMixed, type];
    });
  };

  const loadQuestion = useCallback(
    async (sess: CalcSession) => {
      setLoading(true);
      setFeedback('idle');
      setExplanation('');
      try {
        const { data } = await calcPracticeApi.generateQuestion({
          session_id: sess.id,
          practice_type: selectedTypes.includes('mixed') ? 'mixed' : selectedTypes[0],
          difficulty: sess.difficulty,
          exclude_fingerprints: fingerprints.slice(-80),
        });
        setQuestion(data);
        setFingerprints((fp) => [...fp, data.fingerprint]);
        questionStartRef.current = Date.now();
        setQuestionElapsedMs(0);
      } catch {
        toast.error('Failed to load question');
      } finally {
        setLoading(false);
      }
    },
    [fingerprints, selectedTypes]
  );

  const startSession = async () => {
    setLoading(true);
    try {
      const types = selectedTypes.includes('mixed') || selectedTypes.length === 0 ? ['mixed'] : selectedTypes;
      const duration = MODE_INFO[mode].duration ?? undefined;
      const { data } = await calcPracticeApi.createSession({
        mode,
        difficulty,
        practice_types: types,
        duration_limit_sec: duration,
      });
      setSession(data);
      setFingerprints([]);
      setCorrectStreak(0);
      setSummary(null);
      setPhase('practice');
      if (duration) setTimeLeftSec(duration);
      await loadQuestion(data);
    } catch {
      toast.error('Could not start session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phase !== 'practice' || timeLeftSec == null) return;
    timerRef.current = setInterval(() => {
      setTimeLeftSec((t) => {
        if (t == null || t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          endSession();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session?.id]);

  useEffect(() => {
    if (phase !== 'practice' || feedback !== 'idle') {
      if (qTimerRef.current) clearInterval(qTimerRef.current);
      return;
    }
    qTimerRef.current = setInterval(() => {
      setQuestionElapsedMs(Date.now() - questionStartRef.current);
    }, 100);
    return () => {
      if (qTimerRef.current) clearInterval(qTimerRef.current);
    };
  }, [phase, feedback, question?.question_id]);

  const endSession = async () => {
    if (!session || endingRef.current) return;
    endingRef.current = true;
    setLoading(true);
    try {
      const { data } = await calcPracticeApi.endSession(session.id);
      setSummary(data);
      setSession(data.session);
      setPhase('summary');
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeftSec(null);
      await loadAnalytics();
      toast.success(data.message);
    } catch {
      toast.error('Failed to end session');
    } finally {
      setLoading(false);
      endingRef.current = false;
    }
  };

  const submitAnswer = async (raw: string) => {
    if (!session || !question) return;
    const userVal = parseFloat(raw.replace(/,/g, ''));
    if (Number.isNaN(userVal)) {
      toast.error('Enter a valid number');
      return;
    }
    const timeMs = Date.now() - questionStartRef.current;
    setLoading(true);
    try {
      const { data } = await calcPracticeApi.submitAttempt({
        session_id: session.id,
        question_id: question.question_id,
        practice_type: question.practice_type,
        difficulty: question.difficulty,
        question_text: question.question_text,
        correct_answer: 0,
        user_answer: userVal,
        skipped: false,
        time_ms: timeMs,
        fingerprint: question.fingerprint,
        explanation: '',
      });
      await handleResult(data);
    } catch (err) {
      toast.error(apiError(err, 'Submit failed'));
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = async () => {
    if (!session || !question) return;
    setLoading(true);
    try {
      const { data } = await calcPracticeApi.submitAttempt({
        session_id: session.id,
        question_id: question.question_id,
        practice_type: question.practice_type,
        difficulty: question.difficulty,
        question_text: question.question_text,
        correct_answer: 0,
        user_answer: null,
        skipped: true,
        time_ms: Date.now() - questionStartRef.current,
        fingerprint: question.fingerprint,
        explanation: '',
      });
      setFeedback('skipped');
      setExplanation(data.explanation);
      setDisplayAnswer(data.display_answer);
      setCorrectStreak(0);
      await refreshSessionStats();
    } catch (err) {
      toast.error(apiError(err, 'Skip failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResult = async (data: CalcAttemptResult) => {
    setFeedback(data.is_correct ? 'correct' : 'wrong');
    setExplanation(data.explanation);
    setDisplayAnswer(data.display_answer);
    if (data.is_correct) {
      const next = correctStreak + 1;
      setCorrectStreak(next);
      if (next >= 3 || data.streak_bonus) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
      }
      if (data.xp_gained > 0) toast.success(`+${data.xp_gained} XP`, { duration: 1200 });
    } else {
      setCorrectStreak(0);
    }
    await refreshSessionStats();
  };

  const refreshSessionStats = async () => {
    try {
      const { data: active } = await calcPracticeApi.activeSession();
      if (active) setSession(active);
    } catch {
      /* keep local session state */
    }
  };

  const nextQuestion = async () => {
    if (!session) return;
    await loadQuestion(session);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <ConfettiBurst show={confetti} />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
          <Calculator className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Calculation Trainer</h1>
          <p className="text-sm text-slate-400">Mental math speed · accuracy · SSC warm-up</p>
        </div>
      </motion.div>

      {analytics && phase === 'setup' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Solved', value: analytics.total_questions, color: 'text-blue-400' },
            { label: 'Accuracy', value: `${analytics.accuracy_pct}%`, color: 'text-green-400' },
            { label: 'Streak', value: analytics.calc_streak, color: 'text-orange-400' },
            {
              label: 'Avg Speed',
              value: analytics.avg_time_ms ? `${(analytics.avg_time_ms / 1000).toFixed(1)}s` : '—',
              color: 'text-purple-400',
            },
          ].map((s) => (
            <GlassCard key={s.label} className="!p-3 text-center">
              <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
              <p className="text-[10px] text-slate-500 uppercase">{s.label}</p>
            </GlassCard>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {(['practice', 'analytics'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              if (t === 'analytics') loadAnalytics();
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium',
              tab === t ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500'
            )}
          >
            {t === 'practice' ? 'Practice' : 'Analytics'}
          </button>
        ))}
      </div>

      {tab === 'analytics' && !analytics && !analyticsError && analyticsLoading && (
        <GlassCard className="!p-8 text-center text-slate-400">Loading analytics…</GlassCard>
      )}

      {tab === 'analytics' && analyticsError && (
        <GlassCard className="!p-8 text-center space-y-3">
          <p className="text-red-400 text-sm">{analyticsError}</p>
          <button
            type="button"
            onClick={loadAnalytics}
            className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm"
          >
            Retry
          </button>
        </GlassCard>
      )}

      {tab === 'analytics' && !analyticsLoading && !analyticsError && analytics && analytics.total_questions === 0 && (
        <GlassCard className="!p-8 text-center space-y-3">
          <p className="text-white font-medium">No calculation practice yet</p>
          <p className="text-sm text-slate-400">
            Finish at least one question in Practice mode. Stats appear here after each solve.
          </p>
          <button
            type="button"
            onClick={() => setTab('practice')}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm"
          >
            Start practice
          </button>
        </GlassCard>
      )}

      {tab === 'analytics' && !analyticsLoading && !analyticsError && analytics && analytics.total_questions > 0 && (
        <motion.div className="space-y-4">
          <GlassCard className="flex flex-col sm:flex-row items-center gap-6 !p-6">
            <ProgressRing progress={analytics.accuracy_pct} size={100} label="Accuracy" />
            <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Fastest solve</p>
                <p className="text-white font-semibold">
                  {analytics.fastest_time_ms ? `${(analytics.fastest_time_ms / 1000).toFixed(2)}s` : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Sessions</p>
                <p className="text-white font-semibold">{analytics.total_sessions}</p>
              </div>
              <div>
                <p className="text-slate-500">Calc XP</p>
                <p className="text-white font-semibold">{analytics.total_xp_from_calc}</p>
              </div>
              <div>
                <p className="text-slate-500">7-day streak</p>
                <p className="text-orange-400 font-semibold">{analytics.calc_streak} days</p>
              </div>
            </div>
          </GlassCard>

          {insights.length > 0 && (
            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Brain size={18} className="text-purple-400" />
                AI Recommendations
              </h3>
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3 rounded-xl text-sm border',
                      ins.priority === 'high'
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-white/5 border-white/10'
                    )}
                  >
                    <p className="font-medium text-white">{ins.title}</p>
                    <p className="text-slate-400 text-xs mt-1">{ins.message}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {analytics.weak_areas.length > 0 && (
            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-400" />
                Weak Calculation Areas
              </h3>
              <div className="space-y-2">
                {analytics.weak_areas.slice(0, 5).map((w) => (
                  <motion.div key={w.practice_type} className="flex justify-between text-sm">
                    <span className="text-slate-300">{w.label}</span>
                    <span className={w.accuracy_pct < 70 ? 'text-red-400' : 'text-green-400'}>
                      {w.accuracy_pct}% · {w.total_attempts} tries
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}

          {analytics.daily_last_7.length > 0 && (
            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white mb-3">Last 7 days</h3>
              <div className="flex items-end gap-2 h-24">
                {analytics.daily_last_7.map((d) => {
                  const maxQ = Math.max(...analytics.daily_last_7.map((x) => x.questions), 1);
                  const h = Math.max(4, (d.questions / maxQ) * 72);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-blue-500/60"
                        style={{ height: h }}
                        title={`${d.questions} q · ${d.accuracy_pct}%`}
                      />
                      <span className="text-[9px] text-slate-500">{d.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {analytics.by_type.length > 0 && (
            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white mb-3">By category</h3>
              <div className="space-y-2">
                {analytics.by_type.map((t) => (
                  <div key={t.practice_type} className="flex justify-between text-sm">
                    <span className="text-slate-300">{t.label}</span>
                    <span className="text-slate-400">
                      {t.correct}/{t.total} · {t.accuracy_pct}%
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {analytics.badges.length > 0 && (
            <GlassCard className="!p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="text-amber-400" size={18} />
                Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {analytics.badges.map((b) => (
                  <span
                    key={b.id}
                    className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30"
                  >
                    {b.title}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}

      {tab === 'practice' && phase === 'setup' && (
        <PracticeSetup
          selectedTypes={selectedTypes}
          difficulty={difficulty}
          mode={mode}
          onToggleType={toggleType}
          onDifficulty={setDifficulty}
          onMode={setMode}
          onStart={startSession}
          loading={loading}
        />
      )}

      {tab === 'practice' && phase === 'practice' && session && question && (
        <PracticeArena
          session={session}
          questionText={question.question_text}
          practiceType={question.practice_type}
          questionNumber={session.total_questions + (feedback === 'idle' ? 1 : 0)}
          correctStreak={correctStreak}
          timeLeftSec={timeLeftSec}
          questionElapsedMs={questionElapsedMs}
          feedback={feedback}
          explanation={explanation}
          displayAnswer={displayAnswer}
          loading={loading}
          onSubmit={submitAnswer}
          onSkip={skipQuestion}
          onNext={nextQuestion}
          onEnd={endSession}
        />
      )}

      {tab === 'practice' && phase === 'summary' && summary && (
        <GlassCard className="!p-8 text-center">
          <Trophy className="mx-auto text-amber-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">Session Complete</h2>
          <p className="text-slate-400 mb-6">{summary.message}</p>
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <p className="text-3xl font-bold text-green-400">{summary.session.accuracy_pct}%</p>
              <p className="text-xs text-slate-500">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">+{summary.xp_earned}</p>
              <p className="text-xs text-slate-500">XP Earned</p>
            </div>
          </div>
          {summary.badges_earned.length > 0 && (
            <p className="text-sm text-amber-300 mb-4">
              New badges: {summary.badges_earned.join(', ')}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setPhase('setup');
              setSession(null);
              setSummary(null);
            }}
            className="px-6 py-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30"
          >
            Practice Again
          </button>
        </GlassCard>
      )}
    </div>
  );
}
