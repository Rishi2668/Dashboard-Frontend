import { motion } from 'framer-motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import {
  finalizeSubject,
  type SubjectFormState,
  type SubjectKey,
} from '@/lib/mockCalculations';
import { cn } from '@/lib/utils';

const COLOR_RING: Record<string, string> = {
  purple: 'from-violet-500 to-purple-600',
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-emerald-500 to-green-500',
  amber: 'from-amber-500 to-orange-500',
};

interface MockSubjectCardProps {
  subjectKey: SubjectKey;
  label: string;
  color: 'purple' | 'blue' | 'green' | 'amber';
  value: SubjectFormState;
  onChange: (v: SubjectFormState) => void;
  disabled?: boolean;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500/50 outline-none"
      />
    </label>
  );
}

export function MockSubjectCard({
  label,
  color,
  value,
  onChange,
  disabled,
}: MockSubjectCardProps) {
  const stats = finalizeSubject(value);
  const scorePct =
    value.maxMarks > 0 ? Math.round((stats.secured_marks / value.maxMarks) * 1000) / 10 : 0;

  return (
    <motion.div
      layout
      className={cn(
        'glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <motion.div
        className={cn(
          'h-1 rounded-full mb-3 bg-gradient-to-r',
          COLOR_RING[color] ?? COLOR_RING.blue
        )}
      />
      <motion.div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white leading-tight">{label}</h4>
          <p className="text-lg font-bold text-white mt-1">
            {stats.secured_marks || '—'} / {value.maxMarks}
          </p>
          <p className="text-xs text-slate-400">
            Attempted — {stats.attempted || 0} / {value.totalQuestions}
          </p>
        </div>
        <ProgressRing
          progress={stats.accuracy}
          size={72}
          strokeWidth={6}
          centerText={`${stats.accuracy}%`}
          centerHint="accuracy"
        />
      </motion.div>

      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Total marks"
          type="number"
          value={value.maxMarks}
          onChange={(v) => onChange({ ...value, maxMarks: parseFloat(v) || 0 })}
        />
        <Field
          label="Secured marks"
          type="number"
          step="0.5"
          value={value.securedMarks}
          onChange={(v) => onChange({ ...value, securedMarks: v })}
        />
        <Field
          label="Total Qs"
          type="number"
          value={value.totalQuestions}
          onChange={(v) => onChange({ ...value, totalQuestions: parseInt(v, 10) || 0 })}
        />
        <Field label="Attempted" value={value.attempted} onChange={(v) => onChange({ ...value, attempted: v })} />
        <Field label="Correct" value={value.correct} onChange={(v) => onChange({ ...value, correct: v })} />
        <div className="block">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Wrong (auto)</span>
          <p className="mt-1.5 px-2.5 py-1.5 text-sm text-red-400 font-medium">{stats.wrong}</p>
        </div>
        <motion.div className="col-span-2 flex justify-between text-xs text-slate-500 pt-1 border-t border-white/5">
          <span>Score {scorePct}%</span>
          <span className="text-orange-400">−{stats.negative} neg</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
