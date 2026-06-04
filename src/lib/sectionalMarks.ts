import type { MockTest } from '@/types';
import type { SubjectKey } from '@/lib/mockCalculations';
import { isSectionalMock, primarySubject } from '@/lib/mockClassification';

const KEYS: SubjectKey[] = ['reasoning', 'quant', 'english', 'gk'];

/** Resolve which subject a sectional row belongs to. */
export function sectionalSubjectKey(m: MockTest): SubjectKey | null {
  const stored = m.section_subject as SubjectKey | undefined;
  if (stored && KEYS.includes(stored)) return stored;
  return primarySubject(m);
}

/** Marks / max / accuracy for one sectional attempt (prefers row totals when sectional-shaped). */
export function getSectionalMarks(m: MockTest, subject?: SubjectKey) {
  const pk = subject ?? sectionalSubjectKey(m);
  const sec = pk ? m[pk] : null;
  const sectional = isSectionalMock(m);

  if (sectional) {
    return {
      subjectKey: pk,
      secured: m.total_score ?? sec?.secured_marks ?? 0,
      max: m.max_score ?? sec?.max_marks ?? 50,
      accuracy: m.accuracy ?? sec?.accuracy ?? 0,
    };
  }

  if (sec && pk) {
    return {
      subjectKey: pk,
      secured: sec.secured_marks,
      max: sec.max_marks,
      accuracy: sec.accuracy,
    };
  }

  return {
    subjectKey: pk,
    secured: m.total_score,
    max: m.max_score,
    accuracy: m.accuracy,
  };
}

export function compareSectionalMocks(a: MockTest, b: MockTest): number {
  const d = new Date(b.test_date).getTime() - new Date(a.test_date).getTime();
  if (d !== 0) return d;
  const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
  const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
  if (cb !== ca) return cb - ca;
  return b.id - a.id;
}
