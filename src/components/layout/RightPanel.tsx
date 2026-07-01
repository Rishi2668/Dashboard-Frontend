import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Clock, Sparkles, Target, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { quotesApi, aiApi, studyApi } from '@/api';
import type { AIInsight, DashboardStats } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { getExamCountdown } from '@/lib/examCountdown';

interface RightPanelProps {
  stats: DashboardStats | null;
}

export function RightPanel({ stats }: RightPanelProps) {
  const { focusMode, pomodoroActive, pomodoroSecondsLeft, startPomodoro, stopPomodoro } = useUIStore();
  const queryClient = useQueryClient();

  const { data: quote } = useQuery({
    queryKey: ['sidebar-quote'],
    queryFn: async () => (await quotesApi.random()).data,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['sidebar-insights'],
    queryFn: async () => (await aiApi.insights()).data.slice(0, 3),
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });

  const { data: targets = [] } = useQuery({
    queryKey: ['sidebar-targets'],
    queryFn: async () => (await studyApi.targets()).data,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const refreshQuote = () => {
    void queryClient.invalidateQueries({ queryKey: ['sidebar-quote'] });
  };

  const generateAI = async () => {
    const { data } = await aiApi.generate();
    queryClient.setQueryData(['sidebar-insights'], data.slice(0, 3));
  };

  if (focusMode) return null;

  const { days, hours, examDateStr } = getExamCountdown(stats?.user?.exam_date);
  const completedTargets = targets.filter((t) => t.completed).length;
  const targetProgress = targets.length ? (completedTargets / targets.length) * 100 : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="hidden xl:flex flex-col gap-4 w-[300px] shrink-0 p-4 pl-0">
      <GlassCard className="!p-4">
        <div className="text-center">
          <Clock className="mx-auto text-blue-400 mb-2" size={24} />
          <p className="text-xs text-slate-400 uppercase tracking-wider">
            SSC CGL Exam
            {examDateStr && (
              <span className="block text-[10px] normal-case text-slate-500 mt-0.5">{examDateStr}</span>
            )}
          </p>
          <div className="flex justify-center gap-3 mt-2">
            <div>
              <p className="text-3xl font-bold text-white">{days}</p>
              <p className="text-[10px] text-slate-500">DAYS</p>
            </div>
            <span className="text-2xl text-slate-600 self-center">:</span>
            <div>
              <p className="text-3xl font-bold text-orange-400">{hours}</p>
              <p className="text-[10px] text-slate-500">HRS</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="!p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="text-orange-400" size={18} />
          <span className="text-sm font-semibold">Streaks</span>
        </div>
        <div className="text-center py-2">
          <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            {stats?.study_streak ?? 0}
          </p>
          <p className="text-xs text-slate-400">Day Study Streak 🔥</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
          {[
            { label: 'Mock', val: stats?.mock_streak ?? 0 },
            { label: 'Revision', val: stats?.revision_streak ?? 0 },
            { label: 'Focus', val: stats?.focus_streak ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-lg py-2">
              <p className="font-bold text-white">{s.val}</p>
              <p className="text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {quote && (
        <GlassCard className="!p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase text-blue-400 tracking-wider">{quote.category}</span>
            <button type="button" onClick={refreshQuote} className="text-slate-500 hover:text-white">
              <RefreshCw size={14} />
            </button>
          </div>
          <p className="text-sm italic text-slate-300 leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
          <p className="text-xs text-slate-500 mt-2">— {quote.author}</p>
        </GlassCard>
      )}

      <GlassCard className="!p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-400" size={18} />
            <span className="text-sm font-semibold">AI Insights</span>
          </div>
          <button type="button" onClick={generateAI} className="text-xs text-blue-400 hover:underline">
            Generate
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {insights.length === 0 ? (
            <p className="text-xs text-slate-500">Click Generate for personalized insights</p>
          ) : (
            (insights as AIInsight[]).map((ins) => (
              <div
                key={ins.id}
                className={`p-2 rounded-lg text-xs ${
                  ins.priority === 'high' ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5'
                }`}
              >
                <p className="font-medium text-white">{ins.title}</p>
                <p className="text-slate-400 mt-0.5">{ins.message}</p>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <GlassCard className="!p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="text-green-400" size={18} />
          <span className="text-sm font-semibold">Today&apos;s Targets</span>
        </div>
        <ProgressRing progress={targetProgress} size={80} strokeWidth={6} label="Done" />
        <p className="text-center text-xs text-slate-400 mt-2">
          {completedTargets}/{targets.length} completed
        </p>
      </GlassCard>

      <GlassCard className="!p-4">
        <p className="text-sm font-semibold mb-2">Pomodoro</p>
        <p className="text-3xl font-mono text-center text-blue-400">{formatTime(pomodoroSecondsLeft)}</p>
        <div className="flex gap-2 mt-3">
          {!pomodoroActive ? (
            <button
              type="button"
              onClick={() => startPomodoro(25)}
              className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
            >
              Start 25m
            </button>
          ) : (
            <button
              type="button"
              onClick={stopPomodoro}
              className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm"
            >
              Stop
            </button>
          )}
        </div>
      </GlassCard>
    </aside>
  );
}
