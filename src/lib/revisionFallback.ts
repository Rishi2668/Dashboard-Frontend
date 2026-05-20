import { addDays, format, isBefore, isValid, parseISO, startOfDay } from 'date-fns';
import type { RevisionDashboardSummary, RevisionItem, RevisionListResponse } from '@/types/revision';

function safeParseDate(value: string): Date | null {
  if (!value) return null;
  const d = parseISO(value.length === 10 ? value : value.slice(0, 10));
  return isValid(d) ? startOfDay(d) : null;
}

export function computeRevisionStatus(
  item: Pick<RevisionItem, 'completed' | 'next_revision_date'>
): RevisionItem['status'] {
  if (item.completed) return 'completed';
  const today = startOfDay(new Date());
  const due = safeParseDate(item.next_revision_date);
  if (!due) return 'upcoming';
  if (isBefore(due, today)) return 'overdue';
  if (due.getTime() === today.getTime()) return 'pending';
  return 'upcoming';
}

export function enrichRevisionItem(raw: Record<string, unknown>): RevisionItem {
  const next = String(raw.next_revision_date ?? '');
  const base = {
    id: Number(raw.id),
    topic: String(raw.topic ?? ''),
    subject: String(raw.subject ?? ''),
    interval_days: Number(raw.interval_days ?? 1),
    next_revision_date: next,
    last_revised: (raw.last_revised as string | null) ?? null,
    completed: Boolean(raw.completed),
    revision_count: Number(raw.revision_count ?? 0),
    notes: (raw.notes as string | null) ?? null,
    priority: String(raw.priority ?? 'medium'),
    difficulty: String(raw.difficulty ?? 'medium'),
    completed_at: (raw.completed_at as string | null) ?? null,
    created_at: (raw.created_at as string | null) ?? null,
  };
  const status = (raw.status as RevisionItem['status']) ?? computeRevisionStatus(base);
  const today = startOfDay(new Date());
  const due = safeParseDate(next);
  const days_overdue =
    status === 'overdue' && due
      ? Math.max(0, Math.round((today.getTime() - due.getTime()) / 86400000))
      : 0;
  return {
    ...base,
    status,
    days_overdue: Number(raw.days_overdue ?? days_overdue),
    suggested_next_date: (raw.suggested_next_date as string | null) ?? (base.completed ? null : next),
  };
}

/** Support legacy API that returned a bare array from GET /revision/ */
export function normalizeRevisionList(data: unknown): RevisionListResponse {
  if (Array.isArray(data)) {
    const items = data.map((row) => enrichRevisionItem(row as Record<string, unknown>));
    return { items, total: items.length, limit: items.length, offset: 0 };
  }
  const obj = data as RevisionListResponse;
  return {
    items: (obj.items ?? []).map((row) =>
      enrichRevisionItem(row as unknown as Record<string, unknown>)
    ),
    total: obj.total ?? obj.items?.length ?? 0,
    limit: obj.limit ?? 100,
    offset: obj.offset ?? 0,
  };
}

export function buildDashboardFromItems(items: RevisionItem[]): RevisionDashboardSummary {
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const pending = items.filter((i) => i.status === 'pending');
  const overdue = items.filter((i) => i.status === 'overdue');
  const upcoming = items.filter((i) => i.status === 'upcoming');
  const completed = items.filter((i) => i.status === 'completed');
  const todayItems = [...overdue, ...pending];
  const tomorrowItems = upcoming.filter((i) => i.next_revision_date === tomorrow);
  const weekEnd = addDays(new Date(), 6);
  const weekItems = items.filter((i) => {
    if (i.completed) return false;
    const d = safeParseDate(i.next_revision_date);
    return d != null && d >= startOfDay(new Date()) && d <= weekEnd;
  });

  return {
    today_count: todayItems.length,
    tomorrow_count: tomorrowItems.length,
    week_count: weekItems.length,
    pending_count: pending.length,
    upcoming_count: upcoming.length,
    overdue_count: overdue.length,
    completed_count: completed.length,
    total_count: items.length,
    completion_percentage: items.length ? Math.round((completed.length / items.length) * 1000) / 10 : 0,
    revision_streak: 0,
    today_items: todayItems.slice(0, 8),
    tomorrow_items: tomorrowItems.slice(0, 8),
    overdue_items: overdue.slice(0, 8),
  };
}
