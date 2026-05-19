import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import { aiApi } from '@/api';
import type { OverallAnalysis } from '@/types/analysis';
import toast from 'react-hot-toast';

export function OverallAnalysisPage() {
  const [data, setData] = useState<OverallAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await aiApi.overallAnalysis();
      setData(res);
    } catch {
      toast.error('Failed to load overall analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="max-w-5xl space-y-4 animate-pulse">
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600">
          <Brain className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Overall AI Analysis</h1>
          <p className="text-sm text-slate-400">
            Unified insights from mocks, revision, weak areas, syllabus & study — {data.generated_at}
          </p>
        </div>
      </motion.div>

      <GlassCard className="!p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ProgressRing
            progress={data.readiness_score}
            size={140}
            label={data.readiness_label}
            sublabel="Readiness"
          />
          <div className="flex-1">
            <p className="text-lg text-slate-200 leading-relaxed">{data.summary}</p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <Target size={16} />
                {data.priority_focus.length} priority actions
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <Zap size={16} />
                {data.sections.length} domains analyzed
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {data.action_plan.length > 0 && (
        <AIInsightsPanel title="Priority Action Plan" insights={data.action_plan} onRefresh={load} />
      )}

      {data.sections.map((section, i) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <AIInsightsPanel
            title={section.title}
            insights={section.insights}
            onRefresh={load}
            compact={section.insights.length === 1}
          />
        </motion.div>
      ))}

      <button
        onClick={load}
        className="w-full py-3 glass rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/10"
      >
        Refresh full analysis
      </button>
    </div>
  );
}
