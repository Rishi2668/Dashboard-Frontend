import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export interface AnalysisInsight {
  type: string;
  priority: string;
  title: string;
  message: string;
}

interface AIInsightsPanelProps {
  title?: string;
  insights: AnalysisInsight[];
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  compact?: boolean;
}

const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/10 border-red-500/25',
  medium: 'bg-amber-500/10 border-amber-500/20',
  low: 'bg-white/5 border-white/10',
};

export function AIInsightsPanel({
  title = 'AI Analysis',
  insights,
  onRefresh,
  loading = false,
  compact = false,
}: AIInsightsPanelProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <GlassCard className={compact ? '!p-3' : '!p-4'}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold text-white flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
          <Sparkles className="text-purple-400" size={compact ? 16 : 18} />
          {title}
        </h3>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-1 text-xs text-blue-400 hover:underline disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing || loading ? 'animate-spin' : ''} />
            {refreshing || loading ? 'Analyzing…' : 'Run AI'}
          </button>
        )}
      </div>

      {loading && insights.length === 0 ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <p className="text-xs text-slate-500">
          Click &quot;Run AI&quot; for personalized analysis based on your data.
        </p>
      ) : (
        <div className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-2'}`}>
          {insights.map((ins, i) => (
            <motion.div
              key={`${ins.title}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-3 rounded-xl border text-sm ${priorityStyles[ins.priority] ?? priorityStyles.low}`}
            >
              <p className="font-medium text-white">{ins.title}</p>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{ins.message}</p>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
