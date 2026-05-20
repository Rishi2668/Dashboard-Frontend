export type CalcMode = 'warmup' | 'speed' | 'accuracy' | 'endless';
export type CalcDifficulty = 'easy' | 'medium' | 'hard';

export interface CalcSession {
  id: number;
  mode: CalcMode;
  difficulty: CalcDifficulty;
  practice_types: string;
  started_at: string;
  ended_at: string | null;
  duration_limit_sec: number | null;
  total_questions: number;
  correct_count: number;
  skipped_count: number;
  total_time_ms: number;
  fastest_time_ms: number | null;
  xp_earned: number;
  completed: boolean;
  accuracy_pct: number;
  avg_time_ms: number;
}

export interface CalcQuestion {
  question_id: string;
  practice_type: string;
  difficulty: CalcDifficulty;
  question_text: string;
  answer_tolerance: number;
  fingerprint: string;
}

export interface CalcAttemptResult {
  id: number;
  is_correct: boolean;
  xp_gained: number;
  streak_bonus: boolean;
  explanation: string;
  correct_answer: number;
  display_answer: string;
  session: CalcSession;
}

export interface CalcSessionEnd {
  session: CalcSession;
  xp_earned: number;
  badges_earned: string[];
  message: string;
}

export interface CalcAnalytics {
  total_questions: number;
  total_correct: number;
  accuracy_pct: number;
  avg_time_ms: number;
  fastest_time_ms: number | null;
  calc_streak: number;
  total_sessions: number;
  total_xp_from_calc: number;
  by_type: {
    practice_type: string;
    label: string;
    total: number;
    correct: number;
    accuracy_pct: number;
    avg_time_ms: number;
  }[];
  weak_areas: {
    practice_type: string;
    label: string;
    accuracy_pct: number;
    total_attempts: number;
    avg_time_ms: number;
  }[];
  daily_last_7: { date: string; questions: number; accuracy_pct: number }[];
  badges: { id: string; title: string; earned: boolean }[];
}

export interface CalcAIInsight {
  title: string;
  message: string;
  priority: string;
  category: string;
}

/** Categories shown in Calc Trainer UI (excludes mixed). */
export const CALC_CATEGORY_TYPES = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'percentage',
  'squares',
  'cube_roots',
  'square_roots',
] as const;

export const PRACTICE_TYPE_LABELS: Record<string, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  percentage: 'Percentage',
  squares: 'Squares',
  cube_roots: 'Cube Roots',
  square_roots: 'Square Roots',
  mixed: 'Mixed Arithmetic',
};

export const MODE_INFO: Record<
  CalcMode,
  { label: string; desc: string; icon: string; duration?: number }
> = {
  warmup: { label: 'Warm-Up', desc: '5 min easy-medium daily activation', icon: '☀️', duration: 300 },
  speed: { label: 'Speed Mode', desc: 'Timer on — max questions in 3 min', icon: '⚡', duration: 180 },
  accuracy: { label: 'Accuracy Mode', desc: 'Focus on correct solving & mistakes', icon: '🎯' },
  endless: { label: 'Endless', desc: 'Infinite adaptive practice', icon: '∞' },
};
