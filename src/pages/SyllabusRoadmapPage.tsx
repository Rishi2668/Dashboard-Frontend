import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SubjectRoadmapCard } from '@/components/syllabus/SubjectRoadmapCard';
import { syllabusApi, aiApi } from '@/api';
import { AIInsightsPanel, type AnalysisInsight } from '@/components/ai/AIInsightsPanel';
import type { SyllabusRoadmap } from '@/types/syllabus';
import toast from 'react-hot-toast';

export function SyllabusRoadmapPage() {
  const [roadmap, setRoadmap] = useState<SyllabusRoadmap | null>(null);
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const runSyllabusAi = useCallback(async () => {
    setAiLoading(true);
    try {
      const { data } = await aiApi.domainAnalysis('syllabus');
      setInsights(data.insights);
    } catch {
      toast.error('AI syllabus analysis failed');
    } finally {
      setAiLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const roadmapRes = await syllabusApi.roadmap();
      setRoadmap(roadmapRes.data);
    } catch {
      toast.error('Failed to load syllabus roadmap');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    runSyllabusAi();
  }, [load, runSyllabusAi]);

  const updateChapter = async (id: number, data: Record<string, unknown>) => {
    try {
      await syllabusApi.updateChapter(id, data);
      await load();
    } catch {
      toast.error('Failed to update chapter');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl animate-pulse">
        <div className="h-40 bg-white/5 rounded-2xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!roadmap) return null;

  const vhIncomplete = roadmap.subjects.flatMap((s) =>
    s.chapters.filter((c) => c.priority === 'very_high' && !c.completed)
  ).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <Map className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">SSC CGL Syllabus Roadmap</h1>
            <p className="text-sm text-slate-400">
              Complete high-priority topics first — {vhIncomplete} very-high chapters remaining
            </p>
          </div>
        </div>
      </motion.div>

      <GlassCard className="flex flex-col sm:flex-row items-center justify-center gap-6 !p-4">
        <ProgressRing progress={roadmap.overall_completion} size={100} label="Syllabus" />
        <div className="text-center sm:text-left">
          <p className="text-lg font-semibold text-white">
            {roadmap.completed_chapters}/{roadmap.total_chapters} chapters done
          </p>
          <p className="text-sm text-slate-400 mt-1">{roadmap.overall_completion}% overall completion</p>
          {roadmap.days_to_exam != null && (
            <p className="text-sm text-orange-400 mt-2">{roadmap.days_to_exam} days to exam</p>
          )}
        </div>
      </GlassCard>

      <AIInsightsPanel
        title="AI Syllabus Roadmap Analysis"
        insights={insights}
        loading={aiLoading}
        onRefresh={runSyllabusAi}
      />

      <GlassCard className="!p-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <TrendingUp size={16} className="text-green-400" />
          <span>
            Study order: <strong className="text-red-400">Very High</strong> →{' '}
            <strong className="text-orange-400">High</strong> →{' '}
            <strong className="text-amber-400">Medium</strong> →{' '}
            <strong className="text-slate-400">Low</strong>
          </span>
        </div>
      </GlassCard>

      <div className="space-y-6">
        {roadmap.subjects.map((subject, i) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <SubjectRoadmapCard subject={subject} onUpdateChapter={updateChapter} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
