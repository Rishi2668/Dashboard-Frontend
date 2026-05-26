import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import type { Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const options: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
  ];

  return (
    <div
      className={cn(
        'flex items-center p-0.5 rounded-xl border border-white/10 bg-white/5',
        '[html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-100',
        className
      )}
      role="group"
      aria-label="Theme"
    >
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
            theme === id
              ? 'bg-blue-500/25 text-blue-400 border border-blue-500/30 shadow-sm [html[data-theme=light]_&]:bg-blue-600/15 [html[data-theme=light]_&]:text-blue-600 [html[data-theme=light]_&]:border-blue-500/25'
              : 'text-slate-400 hover:text-white border border-transparent',
            theme !== id && '[html[data-theme=light]_&]:text-slate-600 [html[data-theme=light]_&]:hover:text-slate-900'
          )}
          aria-pressed={theme === id}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
