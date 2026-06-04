export interface User {
  id: number;
  name: string;
  email: string;
  target_year: number;
  target_rank: number | null;
  target_marks: number | null;
  exam_date: string | null;
  current_mock_score: number;
  best_score: number;
  overall_accuracy: number;
  xp: number;
  level: string;
  created_at: string;
}

export interface XpBreakdown {
  calc_practice: number;
  study_sessions: number;
  mock_tests: number;
  sectional_tests?: number;
  notes: number;
  revision: number;
  syllabus: number;
  accounted_total: number;
}

import type { TargetAnalytics } from '@/types/targetScore';

export interface ApiFeatures {
  study_session_delete: boolean;
  revision_management_v2: boolean;
}

export interface DashboardStats {
  user: User;
  days_left: number;
  study_streak: number;
  mock_streak: number;
  revision_streak: number;
  focus_streak: number;
  today_hours: number;
  week_hours: number;
  month_consistency: number;
  heatmap_data: { date: string; hours: number }[];
  xp: number;
  level: string;
  level_progress: number;
  next_level: string;
  xp_at_level: number;
  xp_for_next: number;
  xp_breakdown?: XpBreakdown;
  target_analytics?: TargetAnalytics;
  api_features?: ApiFeatures;
  achievements: Achievement[];
  streaks: Streak[];
}

export interface Streak {
  streak_type: string;
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
}

export interface Achievement {
  id: number;
  badge_id: string;
  title: string;
  description: string;
  earned_at: string;
}

export interface StudySession {
  id: number;
  date: string;
  hours: number;
  topics_completed: string;
  revision_done: boolean;
  productivity_score: number;
  notes: string | null;
  tasks_completed: number;
  subject_breakdown: string | null;
}

export interface DailyTarget {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  completed: boolean;
  target_date: string;
}

export interface MockSubjectSection {
  label: string;
  max_marks: number;
  secured_marks: number;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  score_percentage: number;
}

export interface MockTest {
  id: number;
  test_name: string | null;
  test_date: string;
  test_type: string;
  section_subject?: string | null;
  created_at?: string;
  total_score: number;
  max_score: number;
  total_questions: number;
  accuracy: number;
  score_percentage: number;
  attempted: number;
  correct: number;
  wrong: number;
  negative_marks: number;
  reasoning: MockSubjectSection;
  quant: MockSubjectSection;
  english: MockSubjectSection;
  gk: MockSubjectSection;
}

export interface MockAIInsight {
  title: string;
  message: string;
  priority: string;
  category: string;
}

export interface SectionalSubjectTarget {
  key: string;
  label: string;
  target: number;
  target_max: number;
  actual: number;
  actual_max: number;
  gap: number;
  achievement_pct: number;
  has_sectional_data: boolean;
  sectional_count: number;
}

export interface MockAnalytics {
  latest_score: number;
  highest_score: number;
  average_score: number;
  average_accuracy: number;
  latest_score_percentage: number;
  total_attempted: number;
  total_correct: number;
  total_wrong: number;
  total_negative: number;
  total_mocks: number;
  score_progression: { date: string; score: number; max_score?: number; percentage?: number; name?: string }[];
  accuracy_trend: { date: string; accuracy: number }[];
  section_comparison: {
    subject: string;
    subject_key?: string;
    score: number;
    max_marks?: number;
    accuracy: number;
    attempted?: number;
    total_questions?: number;
    score_percentage?: number;
  }[];
  subject_accuracy_trends: Record<
    string,
    {
      date: string;
      accuracy: number;
      score: number;
      max_score?: number;
      name?: string;
      mock_id?: number;
    }[]
  >;
  weekly_trend: { week: string; avg_score: number }[];
  weak_subjects: { subject: string; accuracy: number; priority: string }[];
  strongest_subject: string | null;
  improvement_delta: number | null;
  ai_insights: MockAIInsight[];
  target_insights?: MockAIInsight[];
  subject_targets?: SectionalSubjectTarget[];
  target_analytics?: TargetAnalytics;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  note_type: string;
  tags: string | null;
  is_mistake: boolean;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

export type { RevisionItem, RevisionStatus, RevisionDashboardSummary, RevisionAnalytics } from './revision';

export interface WeakTopic {
  id: number;
  topic: string;
  subject: string;
  accuracy: number;
  mistake_count: number;
  priority: string;
  needs_revision: boolean;
  avg_time_seconds: number | null;
}

export interface AIInsight {
  id: number;
  insight_type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
}

export interface PYQAnalytics {
  subject: string;
  completed: number;
  total: number;
  percentage: number;
}
