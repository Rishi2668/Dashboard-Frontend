import type { MockAnalytics } from '@/types';

/** Strip sectional leakage from full-mock analytics API responses. */
export function emptyFullMockAnalytics(base?: MockAnalytics | null): MockAnalytics {
  return {
    latest_score: 0,
    highest_score: 0,
    average_score: 0,
    average_accuracy: 0,
    latest_score_percentage: 0,
    total_attempted: 0,
    total_correct: 0,
    total_wrong: 0,
    total_negative: 0,
    total_mocks: 0,
    score_progression: [],
    accuracy_trend: [],
    section_comparison: [],
    subject_accuracy_trends: {
      reasoning: [],
      quant: [],
      english: [],
      gk: [],
    },
    weekly_trend: [],
    weak_subjects: [],
    strongest_subject: null,
    improvement_delta: null,
    ai_insights: base?.ai_insights?.filter((i) => i.category === 'recommendation') ?? [
      {
        title: 'Log your first full mock',
        message: 'Save a 200-mark SSC CGL full mock here. Sectionals are tracked on Sectional Analytics only.',
        priority: 'high',
        category: 'recommendation',
      },
    ],
    target_insights: [],
    subject_targets: [],
    target_analytics: undefined,
  };
}
