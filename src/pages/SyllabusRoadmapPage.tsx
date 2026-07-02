import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { roadmap2026Api, syllabusApi } from '@/api';
import { setRoadmapMockIntent } from '@/lib/roadmapMockFlow';
import {
  patchChapterCompleted,
  patchDailyHabit,
  patchVirtualTask,
} from '@/lib/roadmapOptimistic';
import { RoadmapSummary } from '@/components/roadmap/RoadmapSummary';
import { DailyStudyHub } from '@/components/roadmap/DailyStudyHub';
import { WeekCard } from '@/components/roadmap/WeekCard';
import type { Roadmap2026 } from '@/types/roadmap2026';
import { cn } from '@/lib/utils';

const ROADMAP_KEY = ['roadmap-2026'] as const;

export function SyllabusRoadmapPage() {
  const queryClient = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ROADMAP_KEY,
    queryFn: async () => (await roadmap2026Api.get()).data,
    staleTime: 2 * 60_000,
  });

  useEffect(() => {
    if (data && selectedWeek === null) {
      setSelectedWeek(data.current_week);
    }
  }, [data, selectedWeek]);

  const setRoadmap = useCallback(
    (updater: (prev: Roadmap2026) => Roadmap2026) => {
      queryClient.setQueryData<Roadmap2026>(ROADMAP_KEY, (prev) => (prev ? updater(prev) : prev));
    },
    [queryClient]
  );

  const toggleTopic = useCallback(
    async (chapterId: number, completed: boolean) => {
      const prev = queryClient.getQueryData<Roadmap2026>(ROADMAP_KEY);
      if (!prev) return;
      setRoadmap((d) => patchChapterCompleted(d, chapterId, completed));
      try {
        await syllabusApi.updateChapter(chapterId, {
          completed,
          progress_percentage: completed ? 100 : 0,
        });
      } catch {
        if (prev) queryClient.setQueryData(ROADMAP_KEY, prev);
        toast.error('Could not save — try again');
      }
    },
    [queryClient, setRoadmap]
  );

  const updateTask = useCallback(
    async (weekNumber: number, taskKey: string, payload: Record<string, unknown>) => {
      const prev = queryClient.getQueryData<Roadmap2026>(ROADMAP_KEY);
      if (!prev) return;
      const completed = payload.completed as boolean | undefined;
      if (typeof completed === 'boolean') {
        if (taskKey.startsWith('daily_')) {
          setRoadmap((d) => patchDailyHabit(d, weekNumber, taskKey, completed));
        } else {
          setRoadmap((d) => patchVirtualTask(d, weekNumber, taskKey, completed));
        }
      }
      try {
        await roadmap2026Api.updateTask(weekNumber, taskKey, payload);
      } catch {
        if (prev) queryClient.setQueryData(ROADMAP_KEY, prev);
        toast.error('Could not save');
      }
    },
    [queryClient, setRoadmap]
  );

  const toggleHabit = useCallback(
    async (weekNumber: number, taskKey: string, completed: boolean) => {
      await updateTask(weekNumber, taskKey, { completed });
    },
    [updateTask]
  );

  if (isLoading || !data) {
    return (
      <div className="roadmap-page mx-auto max-w-2xl space-y-4 animate-pulse px-1">
        <div className="roadmap-summary-card h-40" />
        <div className="h-11 rounded-2xl bg-slate-200/80 dark:bg-white/5" />
        <div className="roadmap-week-card h-96" />
      </div>
    );
  }

  const activeWeek = data.weeks.find((w) => w.number === (selectedWeek ?? data.current_week));
  const todayHint = data.productivity.today_tasks[0];
  const isSunday = data.productivity.mock_reminder;

  const openSundayMock = () => {
    setRoadmapMockIntent(data.current_week, 'mandatory_mock');
  };

  return (
    <div className="roadmap-page mx-auto max-w-2xl px-1 pb-16">
      <RoadmapSummary data={data} />

      {data.daily_study_hub && (
        <div className="mt-5">
          <DailyStudyHub hub={data.daily_study_hub} onToggleHabit={toggleHabit} />
        </div>
      )}

      {isSunday && (
        <div className="roadmap-alert mt-5">
          <p className="text-sm font-medium text-amber-950 dark:text-amber-50">
            Sunday mock day — log your full test in Analytics.
          </p>
          <Link to="/analytics?add=1" onClick={openSundayMock} className="roadmap-alert-btn">
            Log mock
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {!isSunday && todayHint && (
        <div className="roadmap-hint mt-5">
          <span className="roadmap-hint-label">Focus</span>
          {todayHint}
        </div>
      )}

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Your weeks</p>
          {selectedWeek !== data.current_week && (
            <button type="button" onClick={() => setSelectedWeek(data.current_week)} className="roadmap-text-link">
              Jump to week {data.current_week}
            </button>
          )}
        </div>
        <div className="roadmap-week-scroll">
          {data.weeks.map((w) => {
            const active = w.number === selectedWeek;
            return (
              <button
                key={w.number}
                type="button"
                onClick={() => setSelectedWeek(w.number)}
                className={cn(
                  'roadmap-week-pill',
                  active && 'roadmap-week-pill--active',
                  w.is_current && !active && 'roadmap-week-pill--current'
                )}
              >
                <span className="roadmap-week-pill-num">W{w.number}</span>
                <span className="roadmap-week-pill-bar">
                  <span className="roadmap-week-pill-fill" style={{ width: `${w.completion_pct}%` }} />
                </span>
                {w.completion_pct >= 100 && <span className="roadmap-week-pill-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {activeWeek && (
        <div key={activeWeek.number} className="roadmap-week-enter mt-5">
          <WeekCard
            week={activeWeek}
            onToggleTopic={toggleTopic}
            onUpdateTask={updateTask}
            onToggleHabit={toggleHabit}
          />
        </div>
      )}

      <div className="roadmap-schedule-footer mt-10">
        <span className="roadmap-schedule-chip">GS · 3h</span>
        <span className="roadmap-schedule-chip">English · 2.5h</span>
        <span className="roadmap-schedule-chip">Quant + Reasoning · 2h</span>
      </div>
    </div>
  );
}
