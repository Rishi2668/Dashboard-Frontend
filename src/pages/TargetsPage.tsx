import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { studyApi } from '@/api';
import type { DailyTarget } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { pyqApi } from '@/api';
import type { PYQAnalytics } from '@/types';

export function TargetsPage() {
  const [targets, setTargets] = useState<DailyTarget[]>([]);
  const [pyq, setPyq] = useState<PYQAnalytics[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const load = () => {
    studyApi.targets().then((r) => setTargets(r.data));
    pyqApi.analytics().then((r) => setPyq(r.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const addTarget = async () => {
    if (!title.trim()) return;
    await studyApi.createTarget({
      title,
      priority,
      target_date: format(new Date(), 'yyyy-MM-dd'),
    });
    toast.success('Target added');
    setTitle('');
    load();
  };

  const toggle = async (t: DailyTarget) => {
    await studyApi.updateTarget(t.id, { completed: !t.completed });
    load();
  };

  const completed = targets.filter((t) => t.completed).length;
  const progress = targets.length ? (completed / targets.length) * 100 : 0;

  const priorityColors: Record<string, string> = {
    high: 'border-red-500/30 text-red-400',
    medium: 'border-orange-500/30 text-orange-400',
    low: 'border-green-500/30 text-green-400',
  };

  return (
    <motion.div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Target className="text-green-400" />
        Daily Targets & PYQ Tracker
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center">
          <ProgressRing progress={progress} size={100} label="Today" />
          <p className="text-sm text-slate-400 mt-2">
            {completed}/{targets.length} goals done
          </p>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h3 className="font-semibold mb-3">Add Daily Goal</h3>
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete 50 Geometry questions"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="high" className="bg-gray-900">High</option>
              <option value="medium" className="bg-gray-900">Medium</option>
              <option value="low" className="bg-gray-900">Low</option>
            </select>
            <button onClick={addTarget} className="p-2 bg-blue-500 text-white rounded-lg">
              <Plus size={18} />
            </button>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-semibold mb-3">Today's Tasks</h3>
        <motion.div className="space-y-2">
          {targets.map((t) => (
            <motion.div
              key={t.id}
              layout
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                t.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/5'
              }`}
            >
              <button
                onClick={() => toggle(t)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  t.completed ? 'bg-green-500 border-green-500' : 'border-slate-500'
                }`}
              >
                {t.completed && <Check size={14} className="text-white" />}
              </button>
              <div className="flex-1">
                <p className={`text-sm ${t.completed ? 'line-through text-slate-500' : 'text-white'}`}>{t.title}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[t.priority]}`}>
                {t.priority}
              </span>
            </motion.div>
          ))}
          {targets.length === 0 && <p className="text-sm text-slate-500">No targets for today. Add your first goal!</p>}
        </motion.div>
      </GlassCard>

      {pyq.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold mb-3">PYQ Progress by Subject</h3>
          <div className="space-y-3">
            {pyq.map((p) => (
              <div key={p.subject}>
                <motion.div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{p.subject}</span>
                  <span className="text-slate-400">
                    {p.completed}/{p.total} ({p.percentage}%)
                  </span>
                </motion.div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.percentage}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
