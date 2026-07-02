import { useState } from 'react';
import {
  BookOpen,
  Brain,
  Calculator,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Languages,
} from 'lucide-react';
import type { DailyStudyHub as DailyStudyHubData } from '@/types/roadmap2026';
import { cn } from '@/lib/utils';

interface DailyStudyHubProps {
  hub: DailyStudyHubData;
  onToggleHabit: (weekNumber: number, taskKey: string, completed: boolean) => Promise<void>;
}

const SUBJECT_ICON: Record<string, typeof BookOpen> = {
  GS: Brain,
  English: Languages,
  'Quant+Reasoning': Calculator,
};

const SUBJECT_ACCENT: Record<string, string> = {
  GS: 'daily-subject--gs',
  English: 'daily-subject--english',
  'Quant+Reasoning': 'daily-subject--qr',
};

export function DailyStudyHub({ hub, onToggleHabit }: DailyStudyHubProps) {
  const [englishOpen, setEnglishOpen] = useState(false);

  return (
    <section className="english-daily-hub daily-study-hub">
      <header className="english-daily-hub-header">
        <div>
          <p className="roadmap-eyebrow">Daily Study Hub</p>
          <h2 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">
            Week {hub.current_week} · Mon–Sat schedule
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            GS 3h · English 2.5h · Quant + Reasoning 2h — habits repeat every week
          </p>
        </div>
      </header>

      <div className="daily-subjects-stack">
        {hub.subjects.map((sub) => {
          const Icon = SUBJECT_ICON[sub.subject_key] ?? BookOpen;
          const totalMinutes = sub.blocks.reduce((s, b) => s + b.minutes, 0);
          return (
            <article key={sub.subject_key} className={cn('daily-subject-card', SUBJECT_ACCENT[sub.subject_key])}>
              <div className="flex items-start gap-2.5">
                <div className="english-daily-hub-icon">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {sub.label} · {sub.hours}h
                    </h3>
                    <div className="english-streak-badge" title="Consecutive days this week">
                      <Flame size={13} className="text-orange-400" />
                      <span>{sub.streak}</span>
                    </div>
                  </div>
                  {sub.next_topic && (
                    <p className="mt-0.5 text-xs text-slate-500">This week: {sub.next_topic}</p>
                  )}
                </div>
              </div>

              <div className="english-time-bars mt-3">
                {sub.blocks.map((block) => (
                  <div key={`${sub.subject_key}-${block.focus}`} className="english-time-row">
                    <div className="english-time-bar-wrap">
                      <div
                        className={cn('english-time-bar', `english-time-bar--${block.focus}`)}
                        style={{ width: `${(block.minutes / totalMinutes) * 100}%` }}
                      />
                    </div>
                    <div className="english-time-meta">
                      <span className="english-time-label">{block.label}</span>
                      <span className="english-time-mins">{block.minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <p className="english-daily-block-title">
                  <Clock size={12} />
                  {sub.habit_label}
                  <span className="english-vocab-count">
                    {sub.habits_done}/{sub.habits.length}
                  </span>
                </p>
                <div className="english-vocab-days">
                  {sub.habits.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => onToggleHabit(hub.current_week, day.key, !day.completed)}
                      className={cn('english-vocab-day', day.completed && 'english-vocab-day--done')}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="english-phases-panel">
        <button type="button" onClick={() => setEnglishOpen(!englishOpen)} className="english-phases-toggle">
          <span>
            English phase order · Phase {hub.english_current_phase_id}: {hub.english_current_phase_name}
          </span>
          {englishOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {englishOpen && (
          <div className="english-phases-list">
            {hub.english_phases.map((phase) => {
              const active = phase.id === hub.english_current_phase_id;
              return (
                <div key={phase.id} className={cn('english-phase-card', active && 'english-phase-card--active')}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="english-phase-name">
                        Phase {phase.id} — {phase.name}
                      </p>
                      <p className="english-phase-sub">{phase.subtitle}</p>
                    </div>
                    <span className="english-phase-pct">{phase.completion_pct}%</span>
                  </div>
                  <div className="roadmap-progress-track mt-2">
                    <div
                      className="roadmap-progress-fill english-phase-fill"
                      style={{ width: `${phase.completion_pct}%` }}
                    />
                  </div>
                  <div className="english-phase-topics">
                    {phase.topics.map((topic) => (
                      <span
                        key={topic.label}
                        className={cn('english-phase-topic', topic.completed && 'english-phase-topic--done')}
                      >
                        {topic.completed ? '✓' : '○'} {topic.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
