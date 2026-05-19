import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ChapterRow } from './ChapterRow';
import { PrioritySectionLabel } from './PriorityBadge';
import type { SyllabusSubject, SyllabusChapter, Priority } from '@/types/syllabus';
import { cn } from '@/lib/utils';

const colorMap: Record<string, string> = {
  blue: 'from-blue-600/30 to-blue-900/10 border-blue-500/30',
  purple: 'from-purple-600/30 to-purple-900/10 border-purple-500/30',
  orange: 'from-orange-600/30 to-orange-900/10 border-orange-500/30',
  green: 'from-green-600/30 to-green-900/10 border-green-500/30',
};

const PRIORITY_ORDER: Priority[] = ['very_high', 'high', 'medium', 'low'];

interface SubjectRoadmapCardProps {
  subject: SyllabusSubject;
  onUpdateChapter: (id: number, data: Record<string, unknown>) => Promise<void>;
}

function groupByPriority(chapters: SyllabusChapter[]) {
  const groups: Record<Priority, SyllabusChapter[]> = {
    very_high: [],
    high: [],
    medium: [],
    low: [],
  };
  chapters.forEach((ch) => {
    if (groups[ch.priority]) groups[ch.priority].push(ch);
  });
  return groups;
}

export function SubjectRoadmapCard({ subject, onUpdateChapter }: SubjectRoadmapCardProps) {
  const [expanded, setExpanded] = useState(true);
  const groups = groupByPriority(subject.chapters);
  const gradient = colorMap[subject.color] ?? colorMap.blue;

  return (
    <GlassCard className={cn('!p-0 overflow-hidden border', gradient.split(' ').pop())}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full p-6 text-left bg-gradient-to-br',
          gradient.split(' border')[0]
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/10">
              <BookOpen className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{subject.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {subject.completed_chapters}/{subject.total_chapters} chapters · {subject.weak_count} weak
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  Avg accuracy: {subject.average_accuracy}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing
              progress={subject.completion_percentage}
              size={72}
              strokeWidth={6}
              label="Done"
            />
            <ChevronDown
              size={24}
              className={cn('text-slate-400 transition shrink-0', expanded && 'rotate-180')}
            />
          </div>
        </div>
        <div className="mt-4 h-2 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${subject.completion_percentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 space-y-1"
          >
            {PRIORITY_ORDER.map((priority) => {
              const chapters = groups[priority];
              if (!chapters.length) return null;
              return (
                <div key={priority}>
                  <PrioritySectionLabel priority={priority} />
                  <div className="space-y-2">
                    {chapters.map((ch) => (
                      <ChapterRow key={ch.id} chapter={ch} onUpdate={onUpdateChapter} />
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
