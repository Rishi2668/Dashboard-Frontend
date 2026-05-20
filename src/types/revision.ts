export type RevisionStatus = 'pending' | 'upcoming' | 'completed' | 'overdue';

export interface RevisionItem {
  id: number;
  topic: string;
  subject: string;
  interval_days: number;
  next_revision_date: string;
  last_revised: string | null;
  completed: boolean;
  revision_count: number;
  notes?: string | null;
  priority?: string;
  difficulty?: string;
  completed_at?: string | null;
  created_at?: string | null;
  status: RevisionStatus;
  days_overdue: number;
  suggested_next_date?: string | null;
}

export interface RevisionListResponse {
  items: RevisionItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface RevisionDashboardSummary {
  today_count: number;
  tomorrow_count: number;
  week_count: number;
  pending_count: number;
  upcoming_count: number;
  overdue_count: number;
  completed_count: number;
  total_count: number;
  completion_percentage: number;
  revision_streak: number;
  today_items: RevisionItem[];
  tomorrow_items: RevisionItem[];
  overdue_items: RevisionItem[];
}

export interface RevisionAnalytics {
  total_revisions: number;
  total_completed: number;
  pending_count: number;
  upcoming_count: number;
  overdue_count: number;
  completion_percentage: number;
  overdue_percentage: number;
  consistency_percentage: number;
  revision_streak: number;
  longest_revision_streak: number;
  subject_frequency: { subject: string; count: number }[];
  total_revision_cycles: number;
}

export interface RevisionAIRecommendation {
  title: string;
  message: string;
  priority: string;
  category: string;
}

export interface RevisionHistoryEntry {
  id: number;
  revision_item_id: number;
  topic: string;
  subject: string;
  interval_days: number;
  completed_on: string;
  notes?: string | null;
  created_at?: string | null;
}
