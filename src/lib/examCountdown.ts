/** Live countdown from user's exam date (YYYY-MM-DD) or fallback. */
export function getExamCountdown(examDateStr: string | null | undefined, fallbackIso = '2026-06-15') {
  const source = examDateStr || fallbackIso;
  const examDate = new Date(`${source}T23:59:59`);
  const now = new Date();
  const diff = examDate.getTime() - now.getTime();
  const days = Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
  const hours = Math.max(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 0);
  return { days, hours, examDateStr: source };
}
