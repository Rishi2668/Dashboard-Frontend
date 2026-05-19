import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Bookmark,
  AlertTriangle,
  RotateCcw,
  Clock,
  StickyNote,
} from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import type { SyllabusChapter } from '@/types/syllabus';
import { cn } from '@/lib/utils';

interface ChapterRowProps {
  chapter: SyllabusChapter;
  onUpdate: (id: number, data: Record<string, unknown>) => Promise<void>;
  defaultExpanded?: boolean;
}

export function ChapterRow({ chapter, onUpdate, defaultExpanded = false }: ChapterRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [notes, setNotes] = useState(chapter.notes ?? '');
  const [accuracy, setAccuracy] = useState(String(chapter.accuracy || ''));
  const [timeSpent, setTimeSpent] = useState(String(chapter.time_spent_minutes || ''));
  const [saving, setSaving] = useState(false);

  const toggleComplete = async () => {
    const markingComplete = !chapter.completed;
    await onUpdate(chapter.id, {
      completed: markingComplete,
      progress_percentage: markingComplete ? 100 : 0,
    });
  };

  const saveDetails = async () => {
    setSaving(true);
    await onUpdate(chapter.id, {
      notes: notes || null,
      accuracy: accuracy ? parseFloat(accuracy) : 0,
      time_spent_minutes: timeSpent ? parseInt(timeSpent) : 0,
      is_weak: chapter.is_weak,
    });
    setSaving(false);
  };

  const revisionColors: Record<string, string> = {
    not_started: 'text-slate-500',
    pending: 'text-amber-400',
    due: 'text-orange-400',
    overdue: 'text-red-400',
    revised: 'text-green-400',
  };

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border transition-colors',
        chapter.completed
          ? 'bg-green-500/5 border-green-500/20'
          : chapter.is_weak
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-white/[0.03] border-white/5 hover:border-white/10'
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={toggleComplete}
          className={cn(
            'w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition',
            chapter.completed ? 'bg-green-500 border-green-500' : 'border-slate-600 hover:border-blue-400'
          )}
        >
          {chapter.completed && <Check size={14} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <motion.div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-sm font-medium', chapter.completed ? 'text-slate-500 line-through' : 'text-white')}>
              {chapter.sort_order}. {chapter.name}
            </span>
            <PriorityBadge priority={chapter.priority} />
            {chapter.is_weak && (
              <span className="flex items-center gap-0.5 text-[10px] text-red-400">
                <AlertTriangle size={10} /> Weak
              </span>
            )}
            {chapter.bookmarked && <Bookmark size={12} className="text-blue-400 fill-blue-400" />}
          </motion.div>
          <div className="flex items-center gap-3 mt-1.5">
            <motion.div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-[120px]">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${chapter.progress_percentage}%` }}
              />
            </motion.div>
            <span className="text-[10px] text-slate-500">{chapter.progress_percentage.toFixed(0)}%</span>
            {chapter.accuracy > 0 && (
              <span className="text-[10px] text-slate-400">{chapter.accuracy.toFixed(0)}% acc</span>
            )}
            <span className={cn('text-[10px] capitalize', revisionColors[chapter.revision_status] ?? 'text-slate-500')}>
              {chapter.revision_status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 text-slate-500 hover:text-white rounded-lg"
        >
          <ChevronDown size={16} className={cn('transition', expanded && 'rotate-180')} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-3 pt-2 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Progress %</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={chapter.progress_percentage}
                    onChange={(e) => onUpdate(chapter.id, { progress_percentage: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Accuracy %</label>
                  <input
                    value={accuracy}
                    onChange={(e) => setAccuracy(e.target.value)}
                    className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs"
                    placeholder="0-100"
                  />
                </div>
                <motion.div>
                  <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                    <Clock size={10} /> Minutes
                  </label>
                  <input
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs"
                  />
                </motion.div>
                <div className="flex items-end gap-1">
                  <button
                    onClick={() => onUpdate(chapter.id, { mark_revised: true })}
                    className="flex-1 py-1.5 text-xs bg-purple-500/20 text-purple-300 rounded-lg flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={12} /> Revise
                  </button>
                  <button
                    onClick={() => onUpdate(chapter.id, { bookmarked: !chapter.bookmarked })}
                    className={cn(
                      'p-1.5 rounded-lg border',
                      chapter.bookmarked ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'border-white/10 text-slate-500'
                    )}
                  >
                    <Bookmark size={14} />
                  </button>
                  <button
                    onClick={() => onUpdate(chapter.id, { is_weak: !chapter.is_weak })}
                    className={cn(
                      'p-1.5 rounded-lg border',
                      chapter.is_weak ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/10 text-slate-500'
                    )}
                  >
                    <AlertTriangle size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                  <StickyNote size={10} /> Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs resize-none"
                  placeholder="Formulas, tricks, mistakes..."
                />
              </div>
              <button
                onClick={saveDetails}
                disabled={saving}
                className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
              >
                {saving ? 'Saving...' : 'Save details'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
