import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { queryClient } from '@/lib/queryClient';
import { initWebVitals } from '@/lib/webVitals';
import { applyTheme, type Theme } from '@/lib/theme';

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
void initWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
