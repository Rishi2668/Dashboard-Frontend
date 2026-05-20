import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw, Plus, Sparkles, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useOutletContext } from 'react-router-dom';
import { revisionApi } from '@/api';
import { RevisionCard } from '@/components/revision/RevisionCard';
import { RevisionFilters, type RevisionFilterState } from '@/components/revision/RevisionFilters';
import type {
  RevisionAIRecommendation,
  RevisionAnalytics,
  RevisionItem,
} from '@/types/revision';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { SUBJECTS } from '@/lib/utils';

interface LayoutContext {
  refreshStats?: () => void;
}

type TabKey = 'pending' | 'upcoming' | 'completed' | 'overdue' | 'all';

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: 'text-yellow-400' },
  { key: 'upcoming', label: 'Upcoming', color: 'text-blue-400' },
  { key: 'overdue', label: 'Overdue', color: 'text-red-400' },
  { key: 'completed', label: 'Completed', color: 'text-green-400' },
  { key: 'all', label: 'All', color: 'text-slate-300' },
];

export function RevisionPage() {
  const { refreshStats } = useOutletContext<LayoutContext>();
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [analytics, setAnalytics] = useState<RevisionAnalytics | null>(null);
  const [aiRecs, setAiRecs] = useState<RevisionAIRecommendation[]>([]);
  const [tab, setTab] = useState<TabKey>('pending');
  const [filters, setFilters] = useState<RevisionFilterState>({
    status: '',
    subject: '',
    priority: '',
    difficulty: '',
    search: '',
  });
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Quant');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [difficulty, setDifficulty] = useState('medium');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 200 };
      if (filters.status) params.status = filters.status;
      if (filters.subject) params.subject = filters.subject;
      if (filters.priority) params.priority = filters.priority;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.search.trim()) params.search = filters.search.trim();

      const listRes = await revisionApi.list(params);
      setItems(listRes.data.items);

      try {
        const { data } = await revisionApi.analytics();
        setAnalytics(data);
      } catch {
        const items = listRes.data.items;
        const completed = items.filter((i) => i.status === 'completed').length;
        setAnalytics({
          total_revisions: items.length,
          total_completed: completed,
          pending_count: items.filter((i) => i.status === 'pending').length,
          upcoming_count: items.filter((i) => i.status === 'upcoming').length,
          overdue_count: items.filter((i) => i.status === 'overdue').length,
          completion_percentage: items.length ? Math.round((completed / items.length) * 1000) / 10 : 0,
          overdue_percentage: 0,
          consistency_percentage: 0,
          revision_streak: 0,
          longest_revision_streak: 0,
          subject_frequency: [],
          total_revision_cycles: items.reduce((s, i) => s + i.revision_count, 0),
        });
      }

      try {
        const { data } = await revisionApi.aiRecommendations();
        setAiRecs(data);
      } catch {
        setAiRecs([]);
      }

      const pendingToday = listRes.data.items.filter((i) => i.status === 'pending' || i.status === 'overdue');
      if (pendingToday.length > 0) {
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        const reminderKey = `revision-reminder-${todayKey}`;
        if (sessionStorage.getItem(reminderKey) !== '1') {
          toast(`⏰ ${pendingToday.length} revision task(s) need your attention today`, { duration: 4000 });
          sessionStorage.setItem(reminderKey, '1');
        }
      }
    } catch {
      toast.error('Failed to load revision data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabItems = useMemo(() => {
    if (tab === 'all') return items;
    return items.filter((i) => i.status === tab);
  }, [items, tab]);

  const groupedUpcoming = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
    const upcoming = items.filter((i) => i.status === 'upcoming');
    return {
      today: items.filter((i) => (i.status === 'pending' || i.status === 'overdue') && i.next_revision_date === today),
      tomorrow: upcoming.filter((i) => i.next_revision_date === tomorrow),
      week: upcoming.filter((i) => i.next_revision_date > tomorrow),
    };
  }, [items]);

  const addItem = async () => {
    if (!topic.trim()) return;
    await revisionApi.create({
      topic: topic.trim(),
      subject,
      interval_days: 1,
      notes: notes.trim() || undefined,
      priority,
      difficulty,
    });
    toast.success('Revision scheduled — first review in 1 day');
    setTopic('');
    setNotes('');
    void load();
  };

  const complete = async (id: number) => {
    await revisionApi.complete(id);
    toast.success('Revision completed! Next interval scheduled.', { icon: '✅' });
    void load();
    refreshStats?.();
  };

  const removeItem = async (id: number, name: string) => {
    if (!window.confirm(`Remove "${name}" from revision planner?`)) return;
    setDeletingId(id);
    try {
      await revisionApi.delete(id);
      toast.success('Revision item removed');
      void load();
      refreshStats?.();
    } catch {
      toast.error('Could not delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <RotateCcw className="text-blue-400" />
          Revision Management
        </h1>
        <Link to="/" className="text-sm text-slate-400 hover:text-blue-400">
          ← Dashboard
        </Link>
      </div>

      {analytics && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatMini label="Completion" value={`${analytics.completion_percentage}%`} />
          <StatMini label="Consistency" value={`${analytics.consistency_percentage}%`} />
          <StatMini label="Overdue rate" value={`${analytics.overdue_percentage}%`} />
          <StatMini label="Streak" value={`${analytics.revision_streak}🔥`} />
        </div>
      )}

      {analytics && (
        <GlassCard>
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing
              progress={analytics.completion_percentage}
              size={100}
              centerText={`${Math.round(analytics.completion_percentage)}%`}
              centerHint="completed"
            />
            <div className="flex-1 min-w-[200px]">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-blue-400" />
                Revision Analytics
              </h3>
              <p className="text-sm text-slate-400">
                {analytics.total_revision_cycles} cycles · {analytics.total_completed} fully completed ·{' '}
                {analytics.pending_count} pending · {analytics.overdue_count} overdue
              </p>
              {analytics.subject_frequency.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {analytics.subject_frequency.slice(0, 4).map((s) => (
                    <span
                      key={s.subject}
                      className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-300"
                    >
                      {s.subject}: {s.count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {aiRecs.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
            <Sparkles className="text-purple-400" size={18} />
            Smart Revision Insights
          </h3>
          <div className="space-y-2">
            {aiRecs.map((r, i) => (
              <div
                key={`${r.title}-${i}`}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm"
              >
                <p className="font-medium text-white">{r.title}</p>
                <p className="text-slate-400 mt-0.5">{r.message}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="font-semibold mb-3">Add Revision Topic</h3>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Chapter / topic (e.g. Articles, Geometry)"
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
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="high" className="bg-gray-900">
                High priority
              </option>
              <option value="medium" className="bg-gray-900">
                Medium priority
              </option>
              <option value="low" className="bg-gray-900">
                Low priority
              </option>
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="easy" className="bg-gray-900">
                Easy
              </option>
              <option value="medium" className="bg-gray-900">
                Medium
              </option>
              <option value="hard" className="bg-gray-900">
                Hard
              </option>
            </select>
            <button
              onClick={() => void addItem()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-1 text-sm font-medium"
            >
              <Plus size={16} /> Schedule (1→7→30 day)
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <RevisionFilters filters={filters} onChange={setFilters} />
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              tab === t.key
                ? 'bg-blue-500/20 border-blue-500/40 text-white'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <span className={t.color}>{t.label}</span>
            {t.key !== 'all' && (
              <span className="ml-1 text-slate-500">
                ({items.filter((i) => i.status === t.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'upcoming' && (
        <div className="grid md:grid-cols-3 gap-4">
          <TimelineGroup title="Today" items={groupedUpcoming.today} onComplete={complete} onDelete={removeItem} deletingId={deletingId} />
          <TimelineGroup title="Tomorrow" items={groupedUpcoming.tomorrow} onComplete={complete} onDelete={removeItem} deletingId={deletingId} />
          <TimelineGroup title="This week" items={groupedUpcoming.week} onComplete={complete} onDelete={removeItem} deletingId={deletingId} />
        </div>
      )}

      <GlassCard>
        <h3 className="font-semibold mb-3 capitalize">
          {tab === 'all' ? 'All revision items' : `${tab} revisions`}
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tabItems.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No items in this category.</p>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {tabItems.map((item) => (
                <RevisionCard
                  key={item.id}
                  item={item}
                  onComplete={complete}
                  onDelete={removeItem}
                  deleting={deletingId === item.id}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </GlassCard>
    </motion.div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="!p-4 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
    </GlassCard>
  );
}

function TimelineGroup({
  title,
  items,
  onComplete,
  onDelete,
  deletingId,
}: {
  title: string;
  items: RevisionItem[];
  onComplete: (id: number) => void;
  onDelete: (id: number, topic: string) => void;
  deletingId: number | null;
}) {
  return (
    <GlassCard className="!p-4">
      <h4 className="text-sm font-semibold text-blue-300 mb-2">{title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">None</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <RevisionCard
              key={item.id}
              item={item}
              onComplete={onComplete}
              onDelete={onDelete}
              deleting={deletingId === item.id}
              compact
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}
