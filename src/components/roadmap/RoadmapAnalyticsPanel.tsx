import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Roadmap2026 } from '@/types/roadmap2026';

interface RoadmapAnalyticsPanelProps {
  data: Roadmap2026;
}

export function RoadmapAnalyticsPanel({ data }: RoadmapAnalyticsPanelProps) {
  const { analytics } = data;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="roadmap-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Study hours by week</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.study_hours_weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="hours" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="roadmap-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Weekly completion</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.weekly_progress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="roadmap-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Mock scores</h3>
        {analytics.mock_scores.length === 0 ? (
          <p className="text-xs text-slate-500">Log Sunday mocks to see score trends.</p>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.mock_scores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="roadmap-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Mock accuracy</h3>
        {analytics.accuracy_trend.length === 0 ? (
          <p className="text-xs text-slate-500">No accuracy data yet.</p>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.accuracy_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {analytics.weak_areas.length > 0 && (
        <div className="roadmap-card lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Weak areas by subject</h3>
          <div className="flex flex-wrap gap-2">
            {analytics.weak_areas.map((w) => (
              <span
                key={w.subject}
                className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-700 dark:text-red-300"
              >
                {w.subject}: {w.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
