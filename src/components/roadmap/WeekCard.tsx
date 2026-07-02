import type { RoadmapWeek } from '@/types/roadmap2026';
import { TopicCheckbox } from './TopicCheckbox';
import { MockTaskRow } from './MockTaskRow';
import { cn } from '@/lib/utils';

interface WeekCardProps {
  week: RoadmapWeek;
  onToggleTopic: (chapterId: number, completed: boolean) => Promise<void>;
  onUpdateTask: (weekNumber: number, taskKey: string, data: Record<string, unknown>) => Promise<void>;
  onToggleHabit?: (weekNumber: number, taskKey: string, completed: boolean) => Promise<void>;
}

const PHASE_LABEL: Record<number, string> = {
  1: 'Phase 1 · High weightage',
  2: 'Phase 2 · Science & advanced',
  3: 'Phase 3 · Revision',
};

const SUBJECT_DOT: Record<string, string> = {
  GS: 'roadmap-dot--gs',
  English: 'roadmap-dot--english',
  Quant: 'roadmap-dot--quant',
  Reasoning: 'roadmap-dot--reasoning',
};

const DAILY_HABITS = [
  { field: 'daily_gs' as const, label: 'Daily GS', dot: 'roadmap-dot--gs' },
  { field: 'daily_vocab' as const, label: 'Daily Vocabulary', dot: 'roadmap-dot--english' },
  { field: 'daily_qr' as const, label: 'Daily Quant & Reasoning', dot: 'roadmap-dot--quant' },
];

export function WeekCard({ week, onToggleTopic, onUpdateTask, onToggleHabit }: WeekCardProps) {
  const handleTask = (taskKey: string, data: Record<string, unknown>) =>
    onUpdateTask(week.number, taskKey, data);

  return (
    <article className={cn('roadmap-week-card', week.is_current && 'roadmap-week-card--current')}>
      <header className="roadmap-week-header">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="roadmap-eyebrow">{PHASE_LABEL[week.phase] ?? `Phase ${week.phase}`}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{week.label}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {week.start} – {week.end}
            </p>
            {week.english_phase_name && (
              <p className="mt-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                English Phase {week.english_phase}: {week.english_phase_name}
                {week.english_phase_note ? ` · ${week.english_phase_note}` : ''}
              </p>
            )}
          </div>
          <div className="roadmap-week-score">
            <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
              {week.completion_pct}%
            </p>
            <p className="text-[10px] text-slate-500">
              {week.completed_count}/{week.total_count}
            </p>
          </div>
        </div>
        <div className="roadmap-progress-track mt-3.5">
          <div className="roadmap-progress-fill" style={{ width: `${week.completion_pct}%` }} />
        </div>
      </header>

      <div className="space-y-5 pt-1">
        {onToggleHabit && (
          <section className="roadmap-daily-habits-block">
            <h3 className="roadmap-section-label">
              <span className="roadmap-dot roadmap-dot--sunday" />
              Daily habits (Mon–Sat)
            </h3>
            <p className="mb-3 text-xs text-slate-500">Same schedule every week — GS, English, Quant+Reasoning</p>
            <div className="space-y-3">
              {DAILY_HABITS.map(({ field, label, dot }) => {
                const habits = week[field] ?? [];
                if (!habits.length) return null;
                return (
                  <div key={field}>
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span className={cn('roadmap-dot', dot)} />
                      {label}
                    </p>
                    <div className="english-vocab-days english-vocab-days--compact">
                      {habits.map((day) => (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => onToggleHabit(week.number, day.key, !day.completed)}
                          className={cn('english-vocab-day', day.completed && 'english-vocab-day--done')}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {week.sections.map((sec) => (
          <section key={sec.subject}>
            <h3 className="roadmap-section-label">
              <span className={cn('roadmap-dot', SUBJECT_DOT[sec.subject])} />
              {sec.subject}
            </h3>
            <div className="roadmap-topic-list">
              {sec.topics.map((topic) => (
                <TopicCheckbox
                  key={`${sec.subject}-${topic.label}`}
                  label={topic.label}
                  completed={topic.completed}
                  disabled={!topic.chapter_id}
                  onToggle={() =>
                    topic.chapter_id && onToggleTopic(topic.chapter_id, !topic.completed)
                  }
                />
              ))}
            </div>
          </section>
        ))}

        {(week.mock_tasks.length > 0 || week.virtual_tasks.length > 0) && (
          <section className="roadmap-sunday-block">
            <h3 className="roadmap-section-label">
              <span className="roadmap-dot roadmap-dot--sunday" />
              Sunday
            </h3>
            <div className="roadmap-topic-list roadmap-topic-list--sunday">
              {week.mock_tasks
                .filter((t) => t.required !== false && t.key !== 'optional_mock')
                .map((task) => (
                  <MockTaskRow
                    key={task.key ?? task.task_key}
                    weekNumber={week.number}
                    task={task}
                    onUpdate={handleTask}
                  />
                ))}
              {week.virtual_tasks.map((task) => (
                <TopicCheckbox
                  key={task.task_key}
                  label={task.label}
                  completed={task.completed}
                  onToggle={() => task.task_key && handleTask(task.task_key, { completed: !task.completed })}
                />
              ))}
            </div>
          </section>
        )}

        {week.mock_tasks.some((t) => t.key === 'optional_mock') && (
          <section>
            <h3 className="roadmap-section-label">
              <span className="roadmap-dot roadmap-dot--optional" />
              Optional
            </h3>
            <div className="roadmap-topic-list">
              {week.mock_tasks
                .filter((t) => t.key === 'optional_mock')
                .map((task) => (
                  <MockTaskRow
                    key={task.key}
                    weekNumber={week.number}
                    task={task}
                    onUpdate={handleTask}
                  />
                ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
