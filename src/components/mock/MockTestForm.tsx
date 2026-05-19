import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MockSubjectCard } from './MockSubjectCard';
import {
  FULL_MOCK_DEFAULTS,
  MOCK_SUBJECTS,
  emptySubject,
  finalizeSubject,
  sumSubjects,
  type SubjectFormState,
  type SubjectKey,
} from '@/lib/mockCalculations';
import { cn } from '@/lib/utils';

function buildInitialSubjects(type: 'full' | 'sectional'): Record<SubjectKey, SubjectFormState> {
  const sub =
    type === 'full'
      ? emptySubject(FULL_MOCK_DEFAULTS.subjectMax, FULL_MOCK_DEFAULTS.subjectQuestions)
      : emptySubject(50, 25);
  return {
    reasoning: { ...sub },
    quant: { ...sub },
    english: { ...sub },
    gk: { ...sub },
  };
}

export interface MockTestFormPayload {
  test_name: string;
  test_date: string;
  test_type: 'full' | 'sectional';
  max_score: number;
  total_score: number;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  negative_marks: number;
  reasoning: ReturnType<typeof finalizeSubject>;
  quant: ReturnType<typeof finalizeSubject>;
  english: ReturnType<typeof finalizeSubject>;
  gk: ReturnType<typeof finalizeSubject>;
}

interface MockTestFormProps {
  onSubmit: (payload: MockTestFormPayload) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function MockTestForm({ onSubmit, onCancel, saving }: MockTestFormProps) {
  const [testName, setTestName] = useState('');
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [testDate, setTestDate] = useState(todayStr);
  const [testType, setTestType] = useState<'full' | 'sectional'>('full');
  const [subjects, setSubjects] = useState<Record<SubjectKey, SubjectFormState>>(() =>
    buildInitialSubjects('full')
  );
  const [activeSection, setActiveSection] = useState<SubjectKey | null>(null);

  const totals = useMemo(() => sumSubjects(subjects), [subjects]);

  const setSubject = (key: SubjectKey, v: SubjectFormState) => {
    setSubjects((prev) => ({ ...prev, [key]: v }));
  };

  const switchType = (t: 'full' | 'sectional') => {
    setTestType(t);
    setSubjects(buildInitialSubjects(t));
    setActiveSection(t === 'sectional' ? 'quant' : null);
  };

  const handleSubmit = async () => {
    await onSubmit({
      test_name: testName.trim() || `SSC CGL ${testType === 'full' ? 'Full' : 'Sectional'} Mock`,
      test_date: testDate,
      test_type: testType,
      max_score: totals.maxMarks,
      total_score: totals.secured,
      total_questions: totals.totalQuestions,
      attempted: totals.attempted,
      correct: totals.correct,
      wrong: totals.wrong,
      negative_marks: totals.negative,
      reasoning: finalizeSubject(subjects.reasoning),
      quant: finalizeSubject(subjects.quant),
      english: finalizeSubject(subjects.english),
      gk: finalizeSubject(subjects.gk),
    });
  };

  const statTiles = [
    ['Total marks', totals.maxMarks],
    ['Secured', totals.secured.toFixed(1)],
    ['Total Qs', totals.totalQuestions],
    ['Attempted', totals.attempted],
    ['Correct', totals.correct],
    ['Wrong', totals.wrong],
    ['Accuracy', `${totals.accuracy}%`],
    ['Negative', `−${totals.negative}`],
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <GlassCard className="!p-5 space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Calculator size={20} />
          <h2 className="text-lg font-semibold text-white">Save Mock Test</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block sm:col-span-2">
            <span className="text-xs text-slate-500 uppercase">Mock test name</span>
            <input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Oliveboard Full Mock #12"
              className="mt-1 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500 uppercase">Mock date</span>
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
            <p className="text-[10px] text-slate-500 mt-1">Today or earlier only (no future dates)</p>
          </label>
          <div className="block">
            <span className="text-xs text-slate-500 uppercase">Mock type</span>
            <div className="mt-1 flex gap-2">
              {(['full', 'sectional'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchType(t)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium border transition',
                    testType === t
                      ? 'bg-blue-500/25 text-blue-300 border-blue-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  )}
                >
                  {t === 'full' ? 'Full Mock' : 'Sectional Mock'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {testType === 'sectional' && (
          <div className="flex flex-wrap gap-2">
            {MOCK_SUBJECTS.map(({ key, short }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs border',
                  activeSection === key
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'text-slate-500 border-white/10'
                )}
              >
                {short}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="!p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Overall performance</h3>
        <p className="text-xs text-slate-500 mb-4">Auto-calculated from section entries</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing
            progress={totals.scorePct}
            size={100}
            centerText={`${totals.secured}`}
            centerHint={`/ ${totals.maxMarks} marks`}
            label={`${totals.accuracy}% accuracy`}
          />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full text-sm">
            {statTiles.map(([label, val]) => (
              <div key={label} className="glass !p-2.5 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase">{label}</p>
                <p className="text-white font-semibold mt-0.5">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Subject-wise performance</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {MOCK_SUBJECTS.map(({ key, label, color }) =>
            testType === 'full' || activeSection === key ? (
              <MockSubjectCard
                key={key}
                subjectKey={key}
                label={label}
                color={color}
                value={subjects[key]}
                onChange={(v) => setSubject(key, v)}
              />
            ) : null
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl glass text-slate-400 hover:text-white flex items-center gap-2"
        >
          <X size={16} /> Cancel
        </button>
        <button
          type="button"
          disabled={saving || totals.attempted <= 0}
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save mock test'}
        </button>
      </div>
    </motion.div>
  );
}
