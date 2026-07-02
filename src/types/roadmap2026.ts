export interface RoadmapTopic {
  label: string;
  subject_key: string;
  chapter_id: number | null;
  completed: boolean;
  progress_percentage: number;
}

export interface RoadmapTask {
  key?: string;
  task_key?: string;
  label: string;
  required?: boolean;
  completed: boolean;
  score?: number | null;
  accuracy?: number | null;
  time_taken_minutes?: number | null;
  weak_areas?: string | null;
  notes?: string | null;
}

export interface DailyVocabDay {
  key: string;
  label: string;
  completed: boolean;
}

export interface RoadmapWeek {
  number: number;
  phase: number;
  label: string;
  start: string;
  end: string;
  english_phase?: number;
  english_phase_name?: string;
  english_phase_note?: string;
  sections: { subject: string; topics: RoadmapTopic[] }[];
  virtual_tasks: RoadmapTask[];
  mock_tasks: RoadmapTask[];
  daily_vocab: DailyVocabDay[];
  completion_pct: number;
  completed_count: number;
  total_count: number;
  is_current: boolean;
}

export interface RoadmapPhase {
  id: number;
  name: string;
  subtitle: string;
  weeks: number[];
  color: string;
  completion_pct: number;
  completed_count: number;
  total_count: number;
}

export interface EnglishPhaseTopic {
  label: string;
  completed: boolean;
  chapter_id: number | null;
  virtual: boolean;
}

export interface EnglishPhase {
  id: number;
  name: string;
  subtitle: string;
  weeks: number[];
  completion_pct: number;
  completed_count: number;
  total_count: number;
  topics: EnglishPhaseTopic[];
}

export interface EnglishRoadmap {
  phases: EnglishPhase[];
  current_phase_id: number;
  current_phase_name: string;
  daily_block_minutes: { label: string; minutes: number; focus: string }[];
  daily_hours: number;
  current_week_vocab: DailyVocabDay[];
  current_week_english_topics: RoadmapTopic[];
}

export interface VocabStreak {
  current_week_days: number;
  best_this_week: number;
  total_logged: number;
}

export interface SubjectProgress {
  label: string;
  completion_pct: number;
  completed: number;
  total: number;
}

export interface Roadmap2026 {
  exam_label: string;
  roadmap_start: string;
  roadmap_end: string;
  days_remaining: number;
  current_week: number;
  daily_schedule: {
    gs_hours: number;
    english_vocab_hours: number;
    quant_reasoning_hours: number;
    study_days: string;
    sunday: string;
  };
  overall_completion: number;
  overall_completed: number;
  overall_total: number;
  phases: RoadmapPhase[];
  weeks: RoadmapWeek[];
  subject_progress: Record<string, SubjectProgress>;
  mocks_completed: number;
  hours_studied: number;
  completion_streak: number;
  counters: { vocabulary: number; vocabulary_total: number; formula_revision: number; pyq: number };
  english_roadmap: EnglishRoadmap;
  vocab_streak: VocabStreak;
  productivity: {
    today_tasks: string[];
    upcoming_tasks: string[];
    missed_tasks: string[];
    weak_topic_count: number;
    mock_reminder: boolean;
    revision_reminder: boolean;
  };
  analytics: {
    study_hours_weekly: { week: number; label: string; hours: number }[];
    weekly_progress: { week: number; label: string; pct: number }[];
    mock_scores: { date: string; score: number; max_score: number; accuracy: number }[];
    accuracy_trend: { date: string; accuracy: number }[];
    weak_areas: { subject: string; count: number }[];
    total_hours: number;
  };
}

export type RoadmapView = 'dashboard' | 'weekly' | 'phases' | 'analytics';
