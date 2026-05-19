export interface ScoreTarget {
  overall_max_marks: number;
  overall_target_marks: number;
  reasoning_max_marks: number;
  reasoning_target_marks: number;
  quant_max_marks: number;
  quant_target_marks: number;
  english_max_marks: number;
  english_target_marks: number;
  gk_max_marks: number;
  gk_target_marks: number;
  updated_at?: string | null;
}

export interface SubjectTargetComparison {
  key: string;
  label: string;
  actual: number;
  actual_max: number;
  target: number;
  target_max: number;
  gap: number;
  achievement_pct: number;
  target_progress_pct: number;
}

export interface OverallTargetComparison {
  actual: number;
  actual_max: number;
  target: number;
  target_max: number;
  gap: number;
  achievement_pct: number;
  target_progress_pct: number;
  improvement_needed: number;
}

export interface TargetAIInsight {
  title: string;
  message: string;
  priority: string;
  category: string;
}

export interface TargetAnalytics {
  targets: ScoreTarget;
  overall: OverallTargetComparison;
  subjects: SubjectTargetComparison[];
  closest_subject: string | null;
  biggest_gap_subject: string | null;
  goal_achievement_probability: number;
  weekly_trend: { period: string; label: string; avg_score: number; target: number; achievement_pct: number }[];
  monthly_improvement: number | null;
  score_prediction: number | null;
  ai_insights: TargetAIInsight[];
  has_mock_data: boolean;
  latest_mock_date: string | null;
}

export const SUBJECT_TARGET_FIELDS = [
  { key: 'reasoning', label: 'General Intelligence & Reasoning', short: 'Reasoning', maxKey: 'reasoning_max_marks', targetKey: 'reasoning_target_marks' },
  { key: 'quant', label: 'Quantitative Aptitude', short: 'Quant', maxKey: 'quant_max_marks', targetKey: 'quant_target_marks' },
  { key: 'english', label: 'English Comprehension', short: 'English', maxKey: 'english_max_marks', targetKey: 'english_target_marks' },
  { key: 'gk', label: 'General Awareness', short: 'GK', maxKey: 'gk_max_marks', targetKey: 'gk_target_marks' },
] as const;
