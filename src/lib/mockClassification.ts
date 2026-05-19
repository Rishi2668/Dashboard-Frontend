import type { MockTest } from '@/types';

const KEYS = ['reasoning', 'quant', 'english', 'gk'] as const;
const FULL_MOCK_MIN_MAX_SCORE = 100;

function subjectAttempted(m: MockTest, key: (typeof KEYS)[number]): number {
  return m[key]?.attempted ?? 0;
}

function subjectScore(m: MockTest, key: (typeof KEYS)[number]): number {
  return m[key]?.secured_marks ?? 0;
}

function activeSubjects(m: MockTest): (typeof KEYS)[number][] {
  return KEYS.filter((k) => subjectAttempted(m, k) > 0 || subjectScore(m, k) > 0);
}

export function isSectionalMock(m: MockTest): boolean {
  const maxScore = m.max_score ?? 0;
  if (maxScore >= FULL_MOCK_MIN_MAX_SCORE) return false;

  if (m.test_type === 'sectional') return true;

  if (maxScore > 0 && maxScore <= 50) return true;

  const active = activeSubjects(m);
  if (active.length === 1) {
    const only = active[0];
    const othersEmpty = KEYS.every(
      (k) => k === only || (subjectAttempted(m, k) === 0 && subjectScore(m, k) === 0)
    );
    if (othersEmpty) return true;
  }

  return false;
}

export function isFullMock(m: MockTest): boolean {
  if (isSectionalMock(m)) return false;
  return (m.max_score ?? 0) >= FULL_MOCK_MIN_MAX_SCORE;
}

export function filterMocksByType(mocks: MockTest[], type: 'full' | 'sectional'): MockTest[] {
  return mocks.filter(type === 'sectional' ? isSectionalMock : isFullMock);
}

export function primarySubject(m: MockTest): (typeof KEYS)[number] | null {
  const active = activeSubjects(m);
  return active.length === 1 ? active[0] : null;
}

/** True when target/analytics overall looks like a 50-mark sectional, not a 200-mark full mock. */
export function isSectionalShapedOverall(actualMax: number | undefined): boolean {
  return (actualMax ?? 0) > 0 && (actualMax ?? 0) < FULL_MOCK_MIN_MAX_SCORE;
}
