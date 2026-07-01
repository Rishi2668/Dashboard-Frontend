import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { queryClient } from '@/lib/queryClient';
import { applyTheme, type Theme } from '@/lib/theme';
import { prefetchCommonRoutes } from '@/lib/routePrefetch';

function getInitialTheme(): Theme {
  try {
    const stored = JSON.parse(localStorage.getItem('ui-storage') || '{}') as {
      state?: { theme?: Theme };
    };
    return stored.state?.theme === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

applyTheme(getInitialTheme());

const scheduleWebVitals = () => {
  import('@/lib/webVitals').then(({ initWebVitals }) => initWebVitals());
};

if ('requestIdleCallback' in window) {
  (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
    scheduleWebVitals
  );
  (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
    prefetchCommonRoutes
  );
} else {
  setTimeout(scheduleWebVitals, 2000);
  setTimeout(prefetchCommonRoutes, 3000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
