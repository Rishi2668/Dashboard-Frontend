import { format } from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { MOCK_SUBJECTS } from '@/lib/mockCalculations';
import { SectionalTrendChart } from '@/components/mock/SectionalTrendChart';
import { filterMocksByType } from '@/lib/mockClassification';
import {
  compareSectionalMocks,
  getSectionalMarks,
  sectionalSubjectKey,
} from '@/lib/sectionalMarks';
import type { MockAnalytics, MockTest } from '@/types';

const COLORS: Record<string, string> = {
  reasoning: '#a855f7',
  quant: '#3b82f6',
  english: '#22c55e',
  gk: '#f59e0b',
};

interface SectionalSubjectTrendChartsProps {
  trends: MockAnalytics['subject_accuracy_trends'];
  mocks?: MockTest[];
}

function chartDataForSubject(mocks: MockTest[], key: string) {
  const chronological = mocks
    .filter((m) => sectionalSubjectKey(m) === key)
    .sort((a, b) => -compareSectionalMocks(a, b));
  return chronological.map((m, idx) => {
    const marks = getSectionalMarks(m, key as (typeof MOCK_SUBJECTS)[number]['key']);
    const shortDate = format(new Date(m.test_date), 'MMM d, yyyy');
    const title = m.test_name?.trim();
    return {
      id: m.id,
      date: m.test_date,
      label: title ? `${shortDate} (#${idx + 1} · ${title})` : `${shortDate} (#${idx + 1})`,
      score: marks.secured,
      accuracy: marks.accuracy,
      max_score: marks.max,
      name: title,
    };
  });
}

export function SectionalSubjectTrendCharts({ trends, mocks }: SectionalSubjectTrendChartsProps) {
  const sectionalMocks = mocks ? filterMocksByType(mocks, 'sectional') : [];
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Per-subject sectional trends</h3>
      <p className="text-xs text-slate-500 -mt-2">
        Solid line = marks (left axis). Dashed green = accuracy % (right axis). Each chart is separate
        from full mocks.
      </p>
      <div className="grid lg:grid-cols-2 gap-4">
        {MOCK_SUBJECTS.map(({ key, label, short }) => {
          const data =
            sectionalMocks.length > 0
              ? chartDataForSubject(sectionalMocks, key)
              : (trends[key] ?? []).map((p, idx) => {
                  const shortDate = format(new Date(p.date), 'MMM d, yyyy');
                  const title = p.name?.trim();
                  return {
                    id: p.mock_id,
                    date: p.date,
                    label: title
                      ? `${shortDate} (#${idx + 1} · ${title})`
                      : `${shortDate} (#${idx + 1})`,
                    score: p.score,
                    accuracy: p.accuracy,
                    max_score: p.max_score,
                    name: title,
                  };
                });
          return (
            <GlassCard key={key} className="!p-4">
              <h4 className="text-sm font-medium text-white mb-1">{label}</h4>
              <p className="text-[10px] text-slate-500 mb-3">{data.length} sectional attempt(s)</p>
              {data.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No {short} sectionals yet</p>
              ) : (
                <SectionalTrendChart data={data} height={220} marksColor={COLORS[key]} />
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
