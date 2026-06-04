import { API_URL } from '@/api/client';

type MetricPayload = {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
};

// Avoid /metrics/ in the path — many ad blockers block it (ERR_BLOCKED_BY_CLIENT).
const WEB_VITALS_URL = `${API_URL}/perf/cwv`;

function sendMetric(payload: MetricPayload) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(WEB_VITALS_URL, blob);
    return;
  }
  fetch(WEB_VITALS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

async function endpointAvailable(): Promise<boolean> {
  try {
    const res = await fetch(WEB_VITALS_URL, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function initWebVitals() {
  const ok = await endpointAvailable();
  if (!ok) return;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const navType = nav?.type ?? 'navigate';

  try {
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntriesByName('first-contentful-paint')) {
        const value = e.startTime;
        sendMetric({
          name: 'FCP',
          value,
          id: 'fcp',
          rating: value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor',
          navigationType: navType,
        });
      }
    });
    po.observe({ type: 'paint', buffered: true });
  } catch {}

  try {
    let lcp = 0;
    const po = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length) lcp = entries[entries.length - 1].startTime;
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
    window.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden' && lcp > 0) {
          sendMetric({
            name: 'LCP',
            value: lcp,
            id: 'lcp',
            rating: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor',
            navigationType: navType,
          });
        }
      },
      { once: true }
    );
  } catch {}

  try {
    let cls = 0;
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries() as PerformanceEntry[]) {
        const entry = e as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (!entry.hadRecentInput) cls += entry.value ?? 0;
      }
    });
    po.observe({ type: 'layout-shift', buffered: true });
    window.addEventListener(
      'beforeunload',
      () => {
        sendMetric({
          name: 'CLS',
          value: cls,
          id: 'cls',
          rating: cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor',
          navigationType: navType,
        });
      },
      { once: true }
    );
  } catch {}

  if (nav?.responseStart != null) {
    const ttfb = nav.responseStart;
    sendMetric({
      name: 'TTFB',
      value: ttfb,
      id: 'ttfb',
      rating: ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor',
      navigationType: navType,
    });
  }
}
