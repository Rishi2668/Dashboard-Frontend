import { revisionApi } from '@/api';
import { buildDashboardFromItems, enrichRevisionItem } from '@/lib/revisionFallback';
import type { RevisionDashboardSummary } from '@/types/revision';

export async function fetchRevisionDashboard(): Promise<RevisionDashboardSummary> {
  try {
    const { data } = await revisionApi.dashboard();
    return {
      ...data,
      today_items: (data.today_items ?? []).map((i) =>
        enrichRevisionItem(i as unknown as Record<string, unknown>)
      ),
      tomorrow_items: (data.tomorrow_items ?? []).map((i) =>
        enrichRevisionItem(i as unknown as Record<string, unknown>)
      ),
      overdue_items: (data.overdue_items ?? []).map((i) =>
        enrichRevisionItem(i as unknown as Record<string, unknown>)
      ),
      completion_percentage: Number(data.completion_percentage ?? 0),
    };
  } catch {
    const { data } = await revisionApi.list({ limit: 200 });
    return buildDashboardFromItems(data.items);
  }
}
