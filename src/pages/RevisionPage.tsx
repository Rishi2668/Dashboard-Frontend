import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Plus, Check, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useOutletContext } from 'react-router-dom';
import { revisionApi, aiApi } from '@/api';
import { AIInsightsPanel, type AnalysisInsight } from '@/components/ai/AIInsightsPanel';
import type { RevisionItem } from '@/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { SUBJECTS } from '@/lib/utils';

interface LayoutContext {
  refreshStats?: () => void;
}

export function RevisionPage() {
  const { refreshStats } = useOutletContext<LayoutContext>();
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [pending, setPending] = useState<RevisionItem[]>([]);
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState<string>('Quant');
  const [revAi, setRevAi] = useState<AnalysisInsight[]>([]);
  const [revAiLoading, setRevAiLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const runRevAi = async () => {
    setRevAiLoading(true);
    try {
      const { data } = await aiApi.domainAnalysis('revision');
      setRevAi(data.insights);
    } catch {
      toast.error('AI revision analysis failed');
    } finally {
      setRevAiLoading(false);
    }
  };

  const load = () => {
    revisionApi.list().then((r) => setItems(r.data));
    revisionApi.pending().then((r) => setPending(r.data));
  };

  useEffect(() => {
    load();
    runRevAi();
  }, []);

  const addItem = async () => {
    if (!topic.trim()) return;
    await revisionApi.create({ topic, subject, interval_days: 1 });
    toast.success('Revision scheduled (Day 1)');
    setTopic('');
    load();
  };

  const complete = async (id: number) => {
    await revisionApi.complete(id);
    toast.success('Revision done! Next interval scheduled.');
    load();
    refreshStats?.();
  };

  const removeItem = async (id: number, name: string) => {
    if (!window.confirm(`Remove "${name}" from revision planner?`)) return;
    setDeletingId(id);
    try {
      await revisionApi.delete(id);
      toast.success('Revision item removed');
      setItems((prev) => prev.filter((i) => i.id !== id));
      setPending((prev) => prev.filter((i) => i.id !== id));
      refreshStats?.();
      runRevAi();
    } catch {
      toast.error('Could not delete — try again');
      load();
    } finally {
      setDeletingId(null);
    }
  };

  const intervals = [
    { days: 1, label: '1 Day' },
    { days: 7, label: '7 Days' },
    { days: 30, label: '30 Days' },
  ];

  return (
    <motion.div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <RotateCcw className="text-blue-400" />
        Spaced Revision Planner
      </h1>

      <AIInsightsPanel
        title="AI Revision Recommendations"
        insights={revAi}
        loading={revAiLoading}
        onRefresh={runRevAi}
      />

      <GlassCard>
        <h3 className="font-semibold mb-3">Add Topic for Revision</h3>
        <div className="flex flex-wrap gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic name (e.g. Geometry Triangles)"
            className="flex-1 min-w-[200px] px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-gray-900">
                {s}
              </option>
            ))}
          </select>
          <button onClick={addItem} className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-1 text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          {intervals.map((i) => (
            <span key={i.days} className="text-xs px-2 py-1 bg-white/5 rounded-full text-slate-400">
              {i.label} interval
            </span>
          ))}
        </div>
      </GlassCard>

      {pending.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-orange-400 mb-3">⚠️ Due Today ({pending.length})</h3>
          <div className="space-y-2">
            {pending.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl"
              >
                <div>
                  <p className="font-medium text-white">{item.topic}</p>
                  <p className="text-xs text-slate-400">{item.subject} · {item.interval_days}-day cycle</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => complete(item.id)}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                    title="Mark complete"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.topic)}
                    disabled={deletingId === item.id}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/30 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="font-semibold mb-3">All Revision Items</h3>
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No revision items yet.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl ${
                  item.completed ? 'bg-green-500/10' : 'bg-white/5'
                }`}
              >
                <motion.div className="min-w-0 flex-1">
                  <p className="text-white font-medium">{item.topic}</p>
                  <p className="text-xs text-slate-500">
                    {item.subject} · Next: {format(new Date(item.next_revision_date), 'MMM d')} · Rev #
                    {item.revision_count}
                  </p>
                </motion.div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.completed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {item.completed ? 'Done' : `${item.interval_days}d`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.topic)}
                    disabled={deletingId === item.id}
                    title="Delete revision item"
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/30 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
