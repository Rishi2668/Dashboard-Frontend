const DASHBOARD_STATS_KEY = 'dashboard-stats-cache';
const DASHBOARD_STATS_TTL_MS = 5 * 60_000;

export function readDashboardStatsCache<T>(): T | undefined {
  try {
    const raw = sessionStorage.getItem(DASHBOARD_STATS_KEY);
    if (!raw) return undefined;
    const { data, at } = JSON.parse(raw) as { data: T; at: number };
    if (Date.now() - at > DASHBOARD_STATS_TTL_MS) return undefined;
    return data;
  } catch {
    return undefined;
  }
}

export function writeDashboardStatsCache<T>(data: T): void {
  try {
    sessionStorage.setItem(
      DASHBOARD_STATS_KEY,
      JSON.stringify({ data, at: Date.now() })
    );
  } catch {
    /* quota / private mode */
  }
}
