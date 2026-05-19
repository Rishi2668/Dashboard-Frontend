export const NEGATIVE_PER_WRONG = 0.5;

export const MOCK_SUBJECTS = [
  {
    key: 'reasoning' as const,
    label: 'General Intelligence & Reasoning',
    short: 'Reasoning',
    color: 'purple' as const,
  },
  {
    key: 'quant' as const,
    label: 'Quantitative Aptitude',
    short: 'Quant',
    color: 'blue' as const,
  },
  {
    key: 'english' as const,
    label: 'English Comprehension',
    short: 'English',
    color: 'green' as const,
  },
  {
    key: 'gk' as const,
    label: 'General Awareness',
    short: 'GK',
    color: 'amber' as const,
  },
];

export type SubjectKey = (typeof MOCK_SUBJECTS)[number]['key'];

export interface SubjectFormState {
  maxMarks: number;
  securedMarks: string;
  totalQuestions: number;
  attempted: string;
  correct: string;
}

export const emptySubject = (maxMarks = 50, totalQuestions = 25): SubjectFormState => ({
  maxMarks,
  securedMarks: '',
  totalQuestions,
  attempted: '',
  correct: '',
});

export const FULL_MOCK_DEFAULTS = {
  maxScore: 200,
  totalQuestions: 100,
  subjectMax: 50,
  subjectQuestions: 25,
};

export function parseNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function calcWrong(attempted: number, correct: number): number {
  return Math.max(0, attempted - correct);
}

export function calcAccuracy(correct: number, attempted: number): number {
  if (attempted <= 0) return 0;
  return Math.round((correct / attempted) * 1000) / 10;
}

export function calcNegative(wrong: number): number {
  return Math.round(wrong * NEGATIVE_PER_WRONG * 100) / 100;
}

export function finalizeSubject(s: SubjectFormState) {
  const attempted = Math.round(parseNum(s.attempted));
  const correct = Math.round(parseNum(s.correct));
  const wrong = calcWrong(attempted, correct);
  return {
    max_marks: s.maxMarks,
    secured_marks: parseNum(s.securedMarks),
    total_questions: s.totalQuestions,
    attempted,
    correct,
    wrong,
    accuracy: calcAccuracy(correct, attempted),
    negative: calcNegative(wrong),
  };
}

export function sumSubjects(subjects: Record<SubjectKey, SubjectFormState>) {
  const finalized = MOCK_SUBJECTS.map(({ key }) => finalizeSubject(subjects[key]));
  const attempted = finalized.reduce((a, x) => a + x.attempted, 0);
  const correct = finalized.reduce((a, x) => a + x.correct, 0);
  const wrong = finalized.reduce((a, x) => a + x.wrong, 0);
  const secured = finalized.reduce((a, x) => a + x.secured_marks, 0);
  const maxMarks = finalized.reduce((a, x) => a + x.max_marks, 0);
  const totalQuestions = finalized.reduce((a, x) => a + x.total_questions, 0);
  return {
    attempted,
    correct,
    wrong,
    secured,
    maxMarks,
    totalQuestions,
    accuracy: calcAccuracy(correct, attempted),
    negative: calcNegative(wrong),
    scorePct: maxMarks > 0 ? Math.round((secured / maxMarks) * 1000) / 10 : 0,
  };
}
