/** Spaced revision: study today → Day 3, then Day 7, then Day 15 */
export const REVISION_SCHEDULE = [3, 7, 15] as const;

export function revisionStageLabel(intervalDays: number): string {
  if ((REVISION_SCHEDULE as readonly number[]).includes(intervalDays)) {
    return `Day ${intervalDays}`;
  }
  if (intervalDays === 1) return 'Day 3 (legacy)';
  if (intervalDays === 30) return 'Day 15 (legacy)';
  return `${intervalDays}d`;
}

export function nextStageAfterComplete(intervalDays: number): string | null {
  const idx = (REVISION_SCHEDULE as readonly number[]).indexOf(intervalDays);
  if (idx >= 0 && idx < REVISION_SCHEDULE.length - 1) {
    return `Day ${REVISION_SCHEDULE[idx + 1]}`;
  }
  if (intervalDays === 1) return 'Day 7';
  if (intervalDays === 7) return 'Day 15';
  return null;
}
