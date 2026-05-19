export type Priority = 'very_high' | 'high' | 'medium' | 'low';

export interface SyllabusChapter {
  id: number;
  name: string;
  priority: Priority;
  priority_label: string;
  sort_order: number;
  completed: boolean;
  progress_percentage: number;
  accuracy: number;
  revision_status: string;
  revision_count: number;
  last_revised: string | null;
  is_weak: boolean;
  notes: string | null;
  time_spent_minutes: number;
  bookmarked: boolean;
}

export interface SyllabusSubject {
  id: number;
  slug: string;
  name: string;
  short_name: string;
  color: string;
  total_chapters: number;
  completed_chapters: number;
  completion_percentage: number;
  average_accuracy: number;
  weak_count: number;
  chapters: SyllabusChapter[];
}

export interface SyllabusRoadmap {
  subjects: SyllabusSubject[];
  overall_completion: number;
  total_chapters: number;
  completed_chapters: number;
  target_marks: number | null;
  exam_date: string | null;
  days_to_exam: number | null;
}

export interface SyllabusAIInsight {
  type: string;
  priority: string;
  title: string;
  message: string;
  chapter_id: number | null;
}

export interface ChapterProgressUpdate {
  completed?: boolean;
  progress_percentage?: number;
  accuracy?: number;
  revision_status?: string;
  is_weak?: boolean;
  notes?: string;
  time_spent_minutes?: number;
  bookmarked?: boolean;
  mark_revised?: boolean;
}
