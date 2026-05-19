import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { MOCK_SUBJECTS } from '@/lib/mockCalculations';
import type { MockAnalytics } from '@/types';

const chartTooltipStyle = {
  background: '#1a1a24',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
};

const COLORS: Record<string, string> = {
  reasoning: '#a855f7',
  quant: '#3b82f6',
  english: '#22c55e',
  gk: '#f59e0b',
};

interface SectionalSubjectTrendChartsProps {
  trends: MockAnalytics['subject_accuracy_trends'];
}

export function SectionalSubjectTrendCharts({ trends }: SectionalSubjectTrendChartsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Per-subject sectional trends</h3>
      <p className="text-xs text-slate-500 -mt-2">
        Separate score & accuracy history for each subject — not mixed with full mocks.
      </p>
      <div className="grid lg:grid-cols-2 gap-4">
        {MOCK_SUBJECTS.map(({ key, label, short }) => {
          const data = trends[key] ?? [];
          return (
            <GlassCard key={key} className="!p-4">
              <h4 className="text-sm font-medium text-white mb-1">{label}</h4>
              <p className="text-[10px] text-slate-500 mb-3">{data.length} sectional attempt(s)</p>
              {data.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No {short} sectionals yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <YAxis yAxisId="score" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <YAxis yAxisId="acc" orientation="right" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line
                      yAxisId="score"
                      type="monotone"
                      dataKey="score"
                      name="Marks"
                      stroke={COLORS[key]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="acc"
                      type="monotone"
                      dataKey="accuracy"
                      name="Accuracy %"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
