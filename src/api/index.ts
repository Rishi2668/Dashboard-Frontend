import { api } from './client';
import type {
  AIInsight,
  DailyTarget,
  DashboardStats,
  MockAnalytics,
  MockTest,
  Note,
  PYQAnalytics,
  Quote,
  RevisionItem,
  StudySession,
  User,
  WeakTopic,
} from '@/types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; confirm_password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string; remember_me: boolean }) =>
    api.post('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
  updateMe: (data: Partial<User>) => api.patch<User>('/auth/me', data),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
};

export const studyApi = {
  sessions: (limit = 30) => api.get<StudySession[]>('/study/sessions', { params: { limit } }),
  createSession: (data: Partial<StudySession> & { date: string; hours: number }) =>
    api.post<StudySession>('/study/sessions', data),
  heatmap: (days = 90) => api.get<{ date: string; hours: number; level: number }[]>('/study/heatmap', { params: { days } }),
  targets: (target_date?: string) =>
    api.get<DailyTarget[]>('/study/targets', { params: { target_date } }),
  createTarget: (data: { title: string; description?: string; priority: string; target_date: string }) =>
    api.post<DailyTarget>('/study/targets', data),
  updateTarget: (id: number, data: Partial<DailyTarget>) =>
    api.patch<DailyTarget>(`/study/targets/${id}`, data),
  deleteTarget: (id: number) => api.delete(`/study/targets/${id}`),
};

export const mockApi = {
  list: (testType?: 'full' | 'sectional') =>
    api.get<MockTest[]>(testType ? `/mock-tests/?test_type=${testType}` : '/mock-tests/'),
  create: (data: Record<string, unknown>) => api.post<MockTest>('/mock-tests/', data),
  analytics: (testType: 'full' | 'sectional' = 'full') =>
    api.get<MockAnalytics>(`/mock-tests/analytics?test_type=${testType}`),
  delete: (id: number) => api.delete(`/mock-tests/${id}`),
};

export const notesApi = {
  list: (params?: { search?: string; note_type?: string; subject?: string; is_mistake?: boolean }) =>
    api.get<Note[]>('/notes/', { params }),
  create: (data: Partial<Note>) => api.post<Note>('/notes/', data),
  update: (id: number, data: Partial<Note>) => api.patch<Note>(`/notes/${id}`, data),
  delete: (id: number) => api.delete(`/notes/${id}`),
};

export const revisionApi = {
  list: () => api.get<RevisionItem[]>('/revision/'),
  pending: () => api.get<RevisionItem[]>('/revision/pending'),
  create: (data: { topic: string; subject: string; interval_days: number }) =>
    api.post<RevisionItem>('/revision/', data),
  complete: (id: number) => api.post<RevisionItem>(`/revision/${id}/complete`),
  delete: (id: number) => api.delete(`/revision/${id}`),
};

export const weakAreasApi = {
  list: (subject?: string) => api.get<WeakTopic[]>('/weak-areas/', { params: { subject } }),
  create: (data: Partial<WeakTopic>) => api.post<WeakTopic>('/weak-areas/', data),
  autoDetect: () => api.post('/weak-areas/auto-detect'),
  delete: (id: number) => api.delete(`/weak-areas/${id}`),
  deleteAll: () => api.delete('/weak-areas/all'),
};

export const aiApi = {
  insights: () => api.get<AIInsight[]>('/ai/insights'),
  generate: () => api.post<AIInsight[]>('/ai/generate'),
  markRead: (id: number) => api.patch(`/ai/insights/${id}/read`),
  overallAnalysis: () => api.get<import('@/types/analysis').OverallAnalysis>('/ai/overall-analysis'),
  domainAnalysis: (domain: 'mock' | 'revision' | 'weak-areas' | 'syllabus') =>
    api.get<{ domain: string; insights: import('@/types/analysis').AnalysisInsight[] }>(
      `/ai/analysis/${domain}`
    ),
};

export const quotesApi = {
  random: (category?: string) => api.get<Quote>('/quotes/random', { params: { category } }),
};

export const pyqApi = {
  list: () => api.get('/pyq/'),
  analytics: () => api.get<PYQAnalytics[]>('/pyq/analytics'),
  create: (data: Record<string, unknown>) => api.post('/pyq/', data),
};

export const syllabusApi = {
  roadmap: () => api.get<import('@/types/syllabus').SyllabusRoadmap>('/syllabus/roadmap'),
  updateChapter: (id: number, data: import('@/types/syllabus').ChapterProgressUpdate) =>
    api.patch<import('@/types/syllabus').SyllabusChapter>(`/syllabus/chapters/${id}`, data),
  revisionHistory: (id: number) => api.get(`/syllabus/chapters/${id}/history`),
  aiInsights: () => api.get<import('@/types/syllabus').SyllabusAIInsight[]>('/syllabus/ai/insights'),
  aiSuggestions: () => api.get('/syllabus/ai/suggestions'),
  updateExamTargets: (data: { target_rank?: number; target_marks?: number; exam_date?: string }) =>
    api.patch('/syllabus/exam-targets', data),
};

export const scoreTargetsApi = {
  get: () => api.get<import('@/types/targetScore').ScoreTarget>('/score-targets/'),
  update: (data: Partial<import('@/types/targetScore').ScoreTarget>) =>
    api.put<import('@/types/targetScore').ScoreTarget>('/score-targets/', data),
  analytics: () => api.get<import('@/types/targetScore').TargetAnalytics>('/score-targets/analytics'),
};

export const calcPracticeApi = {
  types: () => api.get<{ practice_types: string[]; difficulties: string[]; modes: string[] }>('/calc-practice/types'),
  createSession: (data: {
    mode: string;
    difficulty: string;
    practice_types: string[];
    duration_limit_sec?: number;
  }) => api.post<import('@/types/calcPractice').CalcSession>('/calc-practice/sessions', data),
  activeSession: () => api.get<import('@/types/calcPractice').CalcSession | null>('/calc-practice/sessions/active'),
  generateQuestion: (data: {
    practice_type?: string;
    difficulty?: string;
    session_id?: number;
    exclude_fingerprints?: string[];
  }) => api.post<import('@/types/calcPractice').CalcQuestion>('/calc-practice/questions/generate', data),
  submitAttempt: (data: Record<string, unknown>) =>
    api.post<import('@/types/calcPractice').CalcAttemptResult>('/calc-practice/attempts', data),
  endSession: (sessionId: number) =>
    api.post<import('@/types/calcPractice').CalcSessionEnd>(`/calc-practice/sessions/${sessionId}/end`),
  analytics: () => api.get<import('@/types/calcPractice').CalcAnalytics>('/calc-practice/analytics'),
  aiInsights: () => api.get<import('@/types/calcPractice').CalcAIInsight[]>('/calc-practice/ai-insights'),
};
