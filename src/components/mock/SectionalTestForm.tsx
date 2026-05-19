import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MockSubjectCard } from './MockSubjectCard';
import {
  MOCK_SUBJECTS,
  emptySubject,
  finalizeSubject,
  type SubjectFormState,
  type SubjectKey,
} from '@/lib/mockCalculations';
import { cn } from '@/lib/utils';
import type { MockTestFormPayload } from './MockTestForm';

const ZERO_SECTION = finalizeSubject({
  maxMarks: 0,
  securedMarks: '',
  totalQuestions: 0,
  attempted: '',
  correct: '',
});

interface SectionalTestFormProps {
  onSubmit: (payload: MockTestFormPayload) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function SectionalTestForm({ onSubmit, onCancel, saving }: SectionalTestFormProps) {
  const [testName, setTestName] = useState('');
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [testDate, setTestDate] = useState(todayStr);
  const [subject, setSubject] = useState<SubjectKey>('quant');
  const [section, setSection] = useState<SubjectFormState>(() => emptySubject(50, 25));

  const meta = MOCK_SUBJECTS.find((s) => s.key === subject)!;

  const finalized = useMemo(() => finalizeSubject(section), [section]);
  const attempted = finalized.attempted;
  const correct = finalized.correct;
  const wrong = finalized.wrong;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : 0;
  const negative = Math.round(wrong * 0.5 * 100) / 100;
  const scorePct =
    section.maxMarks > 0 ? Math.round((finalized.secured_marks / section.maxMarks) * 1000) / 10 : 0;

  const handleSubmit = async () => {
    const payload: MockTestFormPayload = {
      test_name: testName.trim() || `${meta.short} Sectional`,
      test_date: testDate,
      test_type: 'sectional',
      max_score: section.maxMarks,
      total_score: finalized.secured_marks,
      total_questions: section.totalQuestions,
      attempted,
      correct,
      wrong,
      negative_marks: negative,
      reasoning: subject === 'reasoning' ? finalized : ZERO_SECTION,
      quant: subject === 'quant' ? finalized : ZERO_SECTION,
      english: subject === 'english' ? finalized : ZERO_SECTION,
      gk: subject === 'gk' ? finalized : ZERO_SECTION,
    };
    await onSubmit(payload);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <GlassCard className="!p-5 space-y-4">
        <motion.div className="flex items-center gap-2 text-purple-400">
          <Layers size={20} />
          <h2 className="text-lg font-semibold text-white">Save Sectional Test</h2>
        </motion.div>
        <p className="text-xs text-slate-500">
          One subject per entry — tracked separately from full mocks on the Sectional Analytics page.
        </p>

        <motion.div className="flex flex-wrap gap-2">
          {MOCK_SUBJECTS.map(({ key, short }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSubject(key);
                setSection(emptySubject(50, 25));
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium border transition',
                subject === key
                  ? 'bg-purple-500/25 text-purple-300 border-purple-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              )}
            >
              {short}
            </button>
          ))}
        </motion.div>

        <motion.div className="grid sm:grid-cols-2 gap-3">
          <label className="block sm:col-span-2">
            <span className="text-xs text-slate-500 uppercase">Sectional name</span>
            <input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder={`e.g. ${meta.short} Sectional #5`}
              className="mt-1 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-slate-500 uppercase">Test date</span>
            <input
              type="date"
              value={testDate}
              max={todayStr}
              onChange={(e) => {
                const picked = e.target.value;
                setTestDate(picked > todayStr ? todayStr : picked);
              }}
              className="mt-1 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
            />
          </label>
        </motion.div>
      </GlassCard>

      <GlassCard className="!p-5">
        <motion.div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
          <ProgressRing
            progress={scorePct}
            size={96}
            centerText={`${finalized.secured_marks}`}
            centerHint={`/ ${section.maxMarks}`}
            label={`${accuracy}% accuracy`}
          />
          <motion.div className="grid grid-cols-2 gap-2 text-sm flex-1 w-full">
            {[
              ['Attempted', attempted],
              ['Correct', correct],
              ['Wrong', wrong],
              ['Negative', `−${negative}`],
            ].map(([label, val]) => (
              <motion.div key={label} className="glass !p-2.5 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase">{label}</p>
                <p className="text-white font-semibold">{val}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <MockSubjectCard
          subjectKey={subject}
          label={meta.label}
          color={meta.color}
          value={section}
          onChange={setSection}
        />
      </GlassCard>

      <motion.div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl glass text-slate-400 hover:text-white flex items-center gap-2"
        >
          <X size={16} /> Cancel
        </button>
        <button
          type="button"
          disabled={saving || attempted <= 0}
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save sectional'}
        </button>
      </motion.div>
    </motion.div>
  );
}
