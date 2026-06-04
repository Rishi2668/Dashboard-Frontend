import { format } from 'date-fns';
import type { SectionalTrendPoint } from '@/components/mock/SectionalTrendChart';
import type { MockTest } from '@/types';

/** Oldest → newest (left to right on chart). */
export function compareMocksChronologicalAsc(a: MockTest, b: MockTest): number {
  const d = new Date(a.test_date).getTime() - new Date(b.test_date).getTime();
  if (d !== 0) return d;
  const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
  const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
  if (ca !== cb) return ca - cb;
  return a.id - b.id;
}

/** Newest first (history lists). */
export function compareMocksNewestFirst(a: MockTest, b: MockTest): number {
  return -compareMocksChronologicalAsc(a, b);
}

export function buildTrendChartDataFromMocks(mocks: MockTest[]): SectionalTrendPoint[] {
  const chronological = [...mocks].sort(compareMocksChronologicalAsc);
  return chronological.map((m, idx) => {
    const shortDate = format(new Date(m.test_date), 'MMM d, yyyy');
    const title = m.test_name?.trim();
    return {
      id: m.id,
      date: m.test_date,
      label: title ? `${shortDate} (#${idx + 1} · ${title})` : `${shortDate} (#${idx + 1})`,
      score: m.total_score,
      accuracy: m.accuracy,
      max_score: m.max_score,
      name: title,
    };
  });
}
