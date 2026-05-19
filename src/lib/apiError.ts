import axios from 'axios';

/** Extract a readable message from API errors for toasts. */
export function apiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => (typeof d === 'object' && d && 'msg' in d ? String(d.msg) : String(d))).join(', ');
    }
    if (detail && typeof detail === 'object' && 'message' in detail) {
      return String((detail as { message: string }).message);
    }
    if (err.response?.status === 401) return 'Please log in again';
    if (err.response?.status === 422) return 'Invalid form data — check all fields';
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
