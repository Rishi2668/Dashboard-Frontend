import { useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionalTrendPoint = {
  id?: number;
  date: string;
  label?: string;
  score: number;
  accuracy: number;
  max_score?: number;
  name?: string;
};

type EnrichedPoint = SectionalTrendPoint & {
  attempt: number;
  shortLabel: string;
  scorePct: number;
  scoreDelta: number | null;
  accDelta: number | null;
  gapToTarget: number | null;
};

type ViewMode = 'bars' | 'line';

function enrichData(data: SectionalTrendPoint[], targetMarks?: number): EnrichedPoint[] {
  return data.map((d, i) => {
    const max = d.max_score ?? 50;
    const prev = i > 0 ? data[i - 1] : null;
    const short =
      d.label && d.label.length > 28 ? `${d.label.slice(0, 26)}…` : d.label ?? `Attempt ${i + 1}`;
    return {
      ...d,
      attempt: i + 1,
      shortLabel: short,
      scorePct: max > 0 ? Math.round((d.score / max) * 1000) / 10 : 0,
      scoreDelta: prev ? Math.round((d.score - prev.score) * 10) / 10 : null,
      accDelta: prev ? Math.round((d.accuracy - prev.accuracy) * 10) / 10 : null,
      gapToTarget:
        targetMarks != null ? Math.round(Math.max(0, targetMarks - d.score) * 10) / 10 : null,
    };
  });
}

function InteractiveTooltip({
  active,
  payload,
  targetMarks,
}: {
  active?: boolean;
  payload?: { dataKey?: string; payload?: EnrichedPoint }[];
  targetMarks?: number;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as EnrichedPoint;
  if (!row) return null;

  return (
    <div className="rounded-xl border border-white/15 bg-[#12121a]/95 backdrop-blur-md px-4 py-3 text-xs shadow-2xl min-w-[200px]">
      <p className="font-semibold text-white text-sm mb-0.5">Attempt #{row.attempt}</p>
      <p className="text-slate-400 mb-2 truncate max-w-[220px]">{row.name || row.label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-blue-400">Marks</span>
          <span className="text-white font-bold tabular-nums">
            {row.score} / {row.max_score ?? 50}
            <span className="text-slate-500 font-normal ml-1">({row.scorePct}%)</span>
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-emerald-400">Accuracy</span>
          <span className="text-white font-semibold tabular-nums">{row.accuracy}%</span>
        </div>
        {row.scoreDelta != null && (
          <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
            <span className="text-slate-500">vs previous</span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                row.scoreDelta > 0 ? 'text-green-400' : row.scoreDelta < 0 ? 'text-red-400' : 'text-slate-400'
              )}
            >
              {row.scoreDelta > 0 ? '+' : ''}
              {row.scoreDelta} marks
            </span>
          </div>
        )}
        {targetMarks != null && row.gapToTarget != null && (
          <div className="flex justify-between gap-4">
            <span className="text-purple-400">To target ({targetMarks})</span>
            <span className="text-purple-200 font-medium tabular-nums">
              {row.gapToTarget <= 0 ? 'On target' : `${row.gapToTarget} left`}
            </span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-500 mt-2">Click the bar or chip below to pin this attempt</p>
    </div>
  );
}

function DeltaBadge({ value, suffix }: { value: number | null; suffix: string }) {
  if (value == null) return <span className="text-slate-500 text-xs">First attempt</span>;
  if (value === 0) return <span className="text-slate-400 text-xs">No change</span>;
  const up = value > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
        up ? 'text-green-400' : 'text-red-400'
      )}
    >
      {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {up ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}

interface SectionalTrendChartProps {
  data: SectionalTrendPoint[];
  height?: number;
  marksColor?: string;
  targetMarks?: number;
  showTargetLine?: boolean;
  subjectLabel?: string;
}

export function SectionalTrendChart({
  data,
  height = 360,
  marksColor = '#3b82f6',
  targetMarks,
  showTargetLine = false,
  subjectLabel = 'Sectional',
}: SectionalTrendChartProps) {
  const defaultView: ViewMode = data.length <= 8 ? 'bars' : 'line';
  const [view, setView] = useState<ViewMode>(defaultView);
  const [showMarks, setShowMarks] = useState(true);
  const [showAccuracy, setShowAccuracy] = useState(true);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const enriched = useMemo(() => enrichData(data, targetMarks), [data, targetMarks]);
  const activeIndex = pinnedIndex ?? hoverIndex;
  const selected = activeIndex != null ? enriched[activeIndex] : null;

  const summary = useMemo(() => {
    if (!enriched.length) return null;
    const scores = enriched.map((d) => d.score);
    const best = Math.max(...scores);
    const latest = enriched[enriched.length - 1];
    const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    const first = enriched[0].score;
    const trend = latest.score - first;
    return { best, latest, avg, trend, count: enriched.length };
  }, [enriched]);

  const maxMarks = Math.max(
    50,
    targetMarks ?? 0,
    ...enriched.map((d) => Math.max(d.score, d.max_score ?? 0))
  );
  const marksDomain: [number, number] = [0, Math.ceil(maxMarks * 1.12)];

  const tooltipIndex = (raw: unknown): number | null => {
    if (raw == null) return null;
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'object' && 'index' in raw && typeof (raw as { index: unknown }).index === 'number') {
      return (raw as { index: number }).index;
    }
    return null;
  };

  const handleChartClick = (state: { activeTooltipIndex?: unknown }) => {
    const idx = tooltipIndex(state?.activeTooltipIndex);
    if (idx != null) setPinnedIndex((p) => (p === idx ? null : idx));
  };

  if (!enriched.length) return null;

  return (
    <div className="space-y-4">
      {/* Summary + controls */}
      {summary && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
            {[
              { label: 'Attempts', value: String(summary.count), sub: subjectLabel },
              { label: 'Latest', value: `${summary.latest.score}`, sub: `/${summary.latest.max_score ?? 50}` },
              { label: 'Best', value: `${summary.best}`, sub: 'marks' },
              {
                label: 'Average',
                value: `${summary.avg}`,
                sub: summary.trend !== 0 ? `${summary.trend > 0 ? '+' : ''}${summary.trend} vs first` : 'marks',
              },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 hover:bg-white/[0.07] transition"
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                <p className="text-lg font-bold text-white tabular-nums">
                  {value}
                  <span className="text-xs font-normal text-slate-500 ml-0.5">{sub}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex p-0.5 rounded-lg bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setView('bars')}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition',
                  view === 'bars' ? 'bg-purple-500/30 text-purple-200' : 'text-slate-400 hover:text-white'
                )}
                title="Compare each attempt side by side"
              >
                <BarChart3 size={14} /> Bars
              </button>
              <button
                type="button"
                onClick={() => setView('line')}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition',
                  view === 'line' ? 'bg-purple-500/30 text-purple-200' : 'text-slate-400 hover:text-white'
                )}
                title="See progression over attempts"
              >
                <LineChartIcon size={14} /> Line
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowMarks((v) => !v)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition',
                showMarks
                  ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                  : 'border-white/10 text-slate-500'
              )}
            >
              Marks
            </button>
            <button
              type="button"
              onClick={() => setShowAccuracy((v) => !v)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition',
                showAccuracy
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/10 text-slate-500'
              )}
            >
              Accuracy %
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative rounded-xl bg-black/20 border border-white/5 p-2">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={enriched}
            margin={{ top: 16, right: 12, left: 4, bottom: view === 'bars' ? 8 : 4 }}
            onClick={handleChartClick}
            onMouseMove={(state) => {
              if (pinnedIndex == null) {
                const idx = tooltipIndex(state?.activeTooltipIndex);
                setHoverIndex(idx);
              }
            }}
            onMouseLeave={() => {
              if (pinnedIndex == null) setHoverIndex(null);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="shortLabel"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              interval={0}
              angle={enriched.length > 3 ? -16 : 0}
              textAnchor={enriched.length > 3 ? 'end' : 'middle'}
              height={enriched.length > 3 ? 52 : 36}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              yAxisId="marks"
              domain={marksDomain}
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <YAxis
              yAxisId="accuracy"
              orientation="right"
              domain={[0, 100]}
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              content={<InteractiveTooltip targetMarks={showTargetLine ? targetMarks : undefined} />}
              cursor={{
                fill: 'rgba(168, 85, 247, 0.08)',
                stroke: 'rgba(168, 85, 247, 0.35)',
                strokeWidth: 1,
              }}
            />
            {showTargetLine && targetMarks != null && (
              <ReferenceLine
                yAxisId="marks"
                y={targetMarks}
                stroke="#a855f7"
                strokeDasharray="8 4"
                strokeWidth={2}
                label={{
                  value: `Target ${targetMarks}`,
                  position: 'insideTopRight',
                  fill: '#c4b5fd',
                  fontSize: 11,
                }}
              />
            )}
            {showMarks &&
              (view === 'bars' ? (
                <Bar
                  yAxisId="marks"
                  dataKey="score"
                  name="Marks"
                  fill={marksColor}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                  cursor="pointer"
                >
                  <LabelList
                    dataKey="score"
                    position="top"
                    fill="#e2e8f0"
                    fontSize={11}
                    fontWeight={600}
                  />
                  {enriched.map((_, i) => (
                    <Cell
                      key={i}
                      fill={marksColor}
                      fillOpacity={activeIndex == null || activeIndex === i ? 1 : 0.35}
                    />
                  ))}
                </Bar>
              ) : (
                <Line
                  yAxisId="marks"
                  type="monotone"
                  dataKey="score"
                  name="Marks"
                  stroke={marksColor}
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, index } = props;
                    const isActive = index === activeIndex;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? 8 : 5}
                        fill={isActive ? '#fff' : marksColor}
                        stroke={marksColor}
                        strokeWidth={isActive ? 3 : 0}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  }}
                  activeDot={false}
                />
              ))}
            {showAccuracy && (
              <Line
                yAxisId="accuracy"
                type="monotone"
                dataKey="accuracy"
                name="Accuracy"
                stroke="#22c55e"
                strokeWidth={view === 'line' ? 2 : 2.5}
                strokeDasharray={view === 'bars' ? '0' : '6 4'}
                dot={{ r: view === 'bars' ? 4 : 3, fill: '#22c55e', strokeWidth: 0 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        <div className="absolute top-3 left-3 flex items-center gap-3 text-[10px] text-slate-500 pointer-events-none">
          {showMarks && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: marksColor }} />
              Marks (left)
            </span>
          )}
          {showAccuracy && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-emerald-500" />
              Accuracy % (right)
            </span>
          )}
        </div>
      </div>

      {/* Attempt chips — click to pin */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Select an attempt {pinnedIndex != null ? '(pinned — click again to unpin)' : '(hover chart or tap)'}
        </p>
        <div className="flex flex-wrap gap-2">
          {enriched.map((d, i) => {
            const isPinned = pinnedIndex === i;
            const isHover = hoverIndex === i && pinnedIndex == null;
            return (
              <button
                key={d.id ?? i}
                type="button"
                onClick={() => setPinnedIndex((p) => (p === i ? null : i))}
                onMouseEnter={() => !pinnedIndex && setHoverIndex(i)}
                onMouseLeave={() => !pinnedIndex && setHoverIndex(null)}
                className={cn(
                  'px-3 py-2 rounded-xl text-left text-xs border transition-all min-w-[100px]',
                  isPinned
                    ? 'border-purple-500/60 bg-purple-500/20 ring-2 ring-purple-500/30 scale-[1.02]'
                    : isHover
                      ? 'border-white/25 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                <span className="text-slate-500 block">#{d.attempt}</span>
                <span className="text-white font-bold tabular-nums">
                  {d.score}/{d.max_score ?? 50}
                </span>
                <span className="text-slate-400 block">{d.accuracy}% acc</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned detail panel */}
      {selected && (
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-purple-300 uppercase tracking-wider mb-1">Selected attempt</p>
              <h4 className="text-lg font-bold text-white">
                #{selected.attempt} — {selected.score}/{selected.max_score ?? 50} marks
              </h4>
              <p className="text-sm text-slate-400 mt-0.5">{selected.name || selected.label}</p>
            </div>
            {showTargetLine && targetMarks != null && (
              <div className="flex items-center gap-2 text-sm text-purple-200 bg-purple-500/10 px-3 py-2 rounded-lg">
                <Target size={16} />
                {selected.gapToTarget != null && selected.gapToTarget <= 0
                  ? 'Target reached'
                  : `${selected.gapToTarget} marks to target`}
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="glass !p-3 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase">Score %</p>
              <p className="text-xl font-bold text-white tabular-nums">{selected.scorePct}%</p>
            </div>
            <div className="glass !p-3 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase">Marks change</p>
              <DeltaBadge value={selected.scoreDelta} suffix=" marks" />
            </div>
            <div className="glass !p-3 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase">Accuracy change</p>
              <DeltaBadge value={selected.accDelta} suffix="%" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
