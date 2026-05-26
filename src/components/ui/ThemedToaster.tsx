import { Toaster } from 'react-hot-toast';
import { useUIStore } from '@/store/uiStore';

export function ThemedToaster() {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: isLight
          ? {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
            }
          : {
              background: '#1a1a24',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
            },
      }}
    />
  );
}
