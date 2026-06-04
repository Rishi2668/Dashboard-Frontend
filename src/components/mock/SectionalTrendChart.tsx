import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
export type SectionalTrendPoint = {
  id?: number;
  date: string;
  /** Unique x-axis label (required when multiple attempts share the same date/name). */
  label?: string;
  score: number;
  accuracy: number;
  max_score?: number;
  name?: string;
};

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey?: string; payload?: SectionalTrendPoint }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row =
    (payload.find((p) => p.dataKey === 'score')?.payload as SectionalTrendPoint | undefined) ??
    (payload[0].payload as SectionalTrendPoint);
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-white mb-1">{row.label ?? label}</p>
      {row.name ? <p className="text-slate-500 mb-1.5">{row.name}</p> : null}
      <p>
        <span className="text-blue-400">Marks: </span>
        <span className="text-white font-medium">
          {row.score}
          {row.max_score != null ? ` / ${row.max_score}` : ''}
        </span>
      </p>
      <p className="mt-0.5">
        <span className="text-emerald-400">Accuracy: </span>
        <span className="text-white font-medium">{row.accuracy}%</span>
      </p>
    </div>
  );
}

interface SectionalTrendChartProps {
  data: SectionalTrendPoint[];
  height?: number;
  marksColor?: string;
  targetMarks?: number;
  showTargetLine?: boolean;
}

export function SectionalTrendChart({
  data,
  height = 280,
  marksColor = '#3b82f6',
  targetMarks,
  showTargetLine = false,
}: SectionalTrendChartProps) {
  const maxMarks = Math.max(
    50,
    targetMarks ?? 0,
    ...data.map((d) => Math.max(d.score, d.max_score ?? 0))
  );
  const marksDomain: [number, number] = [0, Math.ceil(maxMarks * 1.15)];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 28, right: 8, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#64748b', fontSize: 9 }}
          interval={0}
          angle={data.length > 2 ? -22 : 0}
          textAnchor={data.length > 2 ? 'end' : 'middle'}
          height={data.length > 2 ? 56 : 32}
        />
        <YAxis
          yAxisId="marks"
          domain={marksDomain}
          allowDecimals={false}
          tick={{ fill: '#64748b', fontSize: 10 }}
          label={{
            value: 'Marks',
            angle: -90,
            position: 'insideLeft',
            fill: '#94a3b8',
            fontSize: 10,
            offset: 10,
          }}
        />
        <YAxis
          yAxisId="accuracy"
          orientation="right"
          domain={[0, 100]}
          allowDecimals={false}
          tick={{ fill: '#64748b', fontSize: 10 }}
          label={{
            value: 'Accuracy %',
            angle: 90,
            position: 'insideRight',
            fill: '#94a3b8',
            fontSize: 10,
            offset: 10,
          }}
        />
        <Tooltip content={<TrendTooltip />} />
        <Legend
          verticalAlign="top"
          align="center"
          iconType="line"
          wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingBottom: 4 }}
        />
        {showTargetLine && targetMarks != null && (
          <ReferenceLine
            yAxisId="marks"
            y={targetMarks}
            stroke="#a855f7"
            strokeDasharray="6 4"
            label={{ value: `Target ${targetMarks}`, fill: '#c4b5fd', fontSize: 10 }}
          />
        )}
        <Line
          yAxisId="marks"
          type="linear"
          dataKey="score"
          name="Marks secured"
          stroke={marksColor}
          strokeWidth={2.5}
          dot={{ r: 5, fill: marksColor }}
          activeDot={{ r: 7 }}
          isAnimationActive={false}
        />
        <Line
          yAxisId="accuracy"
          type="linear"
          dataKey="accuracy"
          name="Accuracy %"
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 4, fill: '#22c55e' }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
