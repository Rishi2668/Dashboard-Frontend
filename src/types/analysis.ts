export interface AnalysisInsight {
  type: string;
  priority: string;
  title: string;
  message: string;
}

export interface OverallAnalysis {
  readiness_score: number;
  readiness_label: string;
  summary: string;
  sections: { id: string; title: string; icon: string; insights: AnalysisInsight[] }[];
  action_plan: AnalysisInsight[];
  priority_focus: AnalysisInsight[];
  generated_at: string;
}
