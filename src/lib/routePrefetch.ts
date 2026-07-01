const routeImports: Record<string, () => Promise<unknown>> = {
  '/roadmap': () => import('@/pages/SyllabusRoadmapPage'),
  '/analytics': () => import('@/pages/AnalyticsPage'),
  '/revision': () => import('@/pages/RevisionPage'),
  '/sectional-analytics': () => import('@/pages/SectionalAnalyticsPage'),
  '/calc-trainer': () => import('@/pages/CalcTrainerPage'),
  '/weak-areas': () => import('@/pages/WeakAreasPage'),
};

export function prefetchRoute(path: string): void {
  const load = routeImports[path];
  if (load) void load();
}

export function prefetchCommonRoutes(): void {
  void import('@/pages/SyllabusRoadmapPage');
  void import('@/pages/AnalyticsPage');
  void import('@/pages/RevisionPage');
}
