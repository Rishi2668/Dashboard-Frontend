import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Clock, Flame, Languages } from 'lucide-react';
import type { EnglishRoadmap, VocabStreak } from '@/types/roadmap2026';
import { cn } from '@/lib/utils';

interface EnglishDailyHubProps {
  english: EnglishRoadmap;
  vocabStreak: VocabStreak;
  currentWeek: number;
  onToggleVocab: (weekNumber: number, taskKey: string, completed: boolean) => Promise<void>;
}

export function EnglishDailyHub({
  english,
  vocabStreak,
  currentWeek,
  onToggleVocab,
}: EnglishDailyHubProps) {
  const [phasesOpen, setPhasesOpen] = useState(false);
  const currentPhase = english.phases.find((p) => p.id === english.current_phase_id);
  const vocabDays = english.current_week_vocab;
  const vocabDone = vocabDays.filter((d) => d.completed).length;
  const nextGrammar = english.current_week_english_topics.find((t) => !t.completed);

  const totalMinutes = english.daily_block_minutes.reduce((s, b) => s + b.minutes, 0);

  return (
    <section className="english-daily-hub">
      <header className="english-daily-hub-header">
        <div className="flex items-start gap-3">
          <div className="english-daily-hub-icon">
            <Languages size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="roadmap-eyebrow">English Daily Hub</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">
              {english.daily_hours}h daily block · Week {currentWeek}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Phase {english.current_phase_id}: {english.current_phase_name}
              {nextGrammar ? ` · Today: ${nextGrammar.label}` : ''}
            </p>
          </div>
          <div className="english-streak-badge" title="Consecutive vocab days this week">
            <Flame size={14} className="text-orange-400" />
            <span>{vocabStreak.current_week_days}</span>
          </div>
        </div>
      </header>

      <div className="english-daily-grid">
        <div className="english-daily-block">
          <p className="english-daily-block-title">
            <Clock size={13} />
            2.5h schedule
          </p>
          <div className="english-time-bars">
            {english.daily_block_minutes.map((block) => (
              <div key={block.focus} className="english-time-row">
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
        </div>

        <div className="english-daily-block">
          <p className="english-daily-block-title">
            <BookOpen size={13} />
            Daily Vocabulary
            <span className="english-vocab-count">
              {vocabDone}/{vocabDays.length} this week
            </span>
          </p>
          <p className="english-vocab-hint">Repeats every week · Mon–Sat · not tied to one phase</p>
          <div className="english-vocab-days">
            {vocabDays.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => onToggleVocab(currentWeek, day.key, !day.completed)}
                className={cn('english-vocab-day', day.completed && 'english-vocab-day--done')}
                title={`Mark ${day.label} vocabulary done`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="english-vocab-footer">
            {vocabStreak.total_logged} vocab sessions logged across the full roadmap
          </p>
        </div>
      </div>

      <div className="english-phases-panel">
        <button
          type="button"
          onClick={() => setPhasesOpen(!phasesOpen)}
          className="english-phases-toggle"
        >
          <span>
            English roadmap order · {currentPhase?.completed_count ?? 0}/{currentPhase?.total_count ?? 0}{' '}
            in {currentPhase?.name}
          </span>
          {phasesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {phasesOpen && (
          <div className="english-phases-list">
            {english.phases.map((phase) => {
              const active = phase.id === english.current_phase_id;
              return (
                <div
                  key={phase.id}
                  className={cn('english-phase-card', active && 'english-phase-card--active')}
                >
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
                        className={cn(
                          'english-phase-topic',
                          topic.completed && 'english-phase-topic--done'
                        )}
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
