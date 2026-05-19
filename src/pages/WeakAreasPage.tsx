import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { weakAreasApi, aiApi } from '@/api';
import { AIInsightsPanel, type AnalysisInsight } from '@/components/ai/AIInsightsPanel';
import type { WeakTopic } from '@/types';
import toast from 'react-hot-toast';
import { SUBJECTS } from '@/lib/utils';

export function WeakAreasPage() {
  const [topics, setTopics] = useState<WeakTopic[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [weakAi, setWeakAi] = useState<AnalysisInsight[]>([]);
  const [weakAiLoading, setWeakAiLoading] = useState(false);
  const [form, setForm] = useState({ topic: '', subject: 'Quant', accuracy: '', mistake_count: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const runWeakAi = async () => {
    setWeakAiLoading(true);
    try {
      const { data } = await aiApi.domainAnalysis('weak-areas');
      setWeakAi(data.insights);
    } catch {
      toast.error('AI weak area analysis failed');
    } finally {
      setWeakAiLoading(false);
    }
  };

  const load = () => {
    weakAreasApi.list(filter || undefined).then((r) => setTopics(r.data));
  };

  useEffect(() => {
    load();
    runWeakAi();
  }, [filter]);

  const autoDetect = async () => {
    const { data } = await weakAreasApi.autoDetect();
    toast.success(`Detected ${(data as { detected: unknown[] }).detected?.length ?? 0} weak areas from mocks`);
    load();
  };

  const addTopic = async () => {
    if (!form.topic.trim()) {
      toast.error('Enter a topic name');
      return;
    }
    const accuracy = parseFloat(form.accuracy);
    const mistakeCount = parseInt(form.mistake_count, 10);
    if (form.accuracy.trim() === '' || Number.isNaN(accuracy) || accuracy < 0 || accuracy > 100) {
      toast.error('Enter accuracy between 0 and 100');
      return;
    }
    if (form.mistake_count.trim() === '' || Number.isNaN(mistakeCount) || mistakeCount < 0) {
      toast.error('Enter number of mistakes');
      return;
    }
    try {
      await weakAreasApi.create({
        topic: form.topic.trim(),
        subject: form.subject,
        accuracy,
        mistake_count: mistakeCount,
        priority: accuracy < 50 ? 'high' : 'medium',
      });
      toast.success('Weak topic added');
      setForm({ topic: '', subject: 'Quant', accuracy: '', mistake_count: '' });
      load();
      runWeakAi();
    } catch {
      toast.error('Topic already exists or could not be added');
    }
  };

  const removeTopic = async (id: number, name: string) => {
    if (!window.confirm(`Remove "${name}" from weak areas?`)) return;
    setDeletingId(id);
    try {
      await weakAreasApi.delete(id);
      toast.success('Removed');
      setTopics((prev) => prev.filter((t) => t.id !== id));
      runWeakAi();
    } catch {
      toast.error('Could not delete — try again');
      load();
    } finally {
      setDeletingId(null);
    }
  };

  const clearAll = async () => {
    if (topics.length === 0) return;
    if (!window.confirm(`Remove all ${topics.length} weak area entries?`)) return;
    try {
      await weakAreasApi.deleteAll();
      toast.success('All weak areas cleared');
      setTopics([]);
      runWeakAi();
    } catch {
      toast.error('Could not clear weak areas');
      load();
    }
  };

  return (
    <motion.div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-red-400" />
          Weak Area Analysis
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={autoDetect}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm"
          >
            <Sparkles size={16} /> AI Auto-Detect
          </button>
          {topics.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20 hover:bg-red-500/20"
            >
              <Trash2 size={16} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1 rounded-full text-xs ${!filter ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-slate-400'}`}
        >
          All
        </button>
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs ${filter === s ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-slate-400'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <AIInsightsPanel
        title="AI Weak Area Analysis"
        insights={weakAi}
        loading={weakAiLoading}
        onRefresh={runWeakAi}
      />

      <GlassCard>
        <div className="grid sm:grid-cols-2 gap-2 mb-2">
          <input
            placeholder="Topic"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-gray-900">
                {s}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            placeholder="Accuracy %"
            value={form.accuracy}
            onChange={(e) => setForm({ ...form, accuracy: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
          <input
            type="number"
            min={0}
            step={1}
            placeholder="Mistakes"
            value={form.mistake_count}
            onChange={(e) => setForm({ ...form, mistake_count: e.target.value })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
        <button onClick={addTopic} className="flex items-center gap-1 text-sm text-blue-400">
          <Plus size={14} /> Add weak topic
        </button>
      </GlassCard>

      <div className="grid gap-3">
        {topics.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ scale: 1.01 }}
            className="glass rounded-xl p-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-white">{t.topic}</p>
                {t.needs_revision && (
                  <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                    Needs Revision
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{t.subject} · {t.mistake_count} mistakes</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p
                  className={`text-2xl font-bold ${
                    t.accuracy < 50 ? 'text-red-400' : t.accuracy < 70 ? 'text-orange-400' : 'text-green-400'
                  }`}
                >
                  {t.accuracy}%
                </p>
                <p className="text-[10px] text-slate-500 uppercase">{t.priority} priority</p>
              </div>
              <button
                type="button"
                onClick={() => removeTopic(t.id, t.topic)}
                disabled={deletingId === t.id}
                title="Delete weak area"
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/30 disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
        {topics.length === 0 && (
          <p className="text-center text-slate-500 py-8">No weak areas tracked. Use AI Auto-Detect or add manually.</p>
        )}
      </div>
    </motion.div>
  );
}
