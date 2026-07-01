import { AlertCircle, Bell, CalendarClock, ListTodo } from 'lucide-react';
import type { Roadmap2026 } from '@/types/roadmap2026';
import { cn } from '@/lib/utils';

interface RoadmapProductivityPanelProps {
  data: Roadmap2026;
}

function TaskList({
  title,
  items,
  icon: Icon,
  empty,
  variant,
}: {
  title: string;
  items: string[];
  icon: typeof ListTodo;
  empty: string;
  variant?: 'warn' | 'default';
}) {
  return (
    <div className="roadmap-card">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <Icon size={16} className={variant === 'warn' ? 'text-amber-500' : 'text-blue-500'} />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className={cn(
                'rounded-lg px-3 py-2 text-xs',
                variant === 'warn'
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300'
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RoadmapProductivityPanel({ data }: RoadmapProductivityPanelProps) {
  const p = data.productivity;

  return (
    <div className="space-y-4">
      {(p.mock_reminder || p.revision_reminder) && (
        <div className="flex flex-wrap gap-2">
          {p.mock_reminder && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
              <Bell size={12} /> Sunday — mandatory mock today
            </span>
          )}
          {p.revision_reminder && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300">
              <AlertCircle size={12} /> {p.weak_topic_count} weak topics need revision
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <TaskList
          title="Today's tasks"
          items={p.today_tasks}
          icon={ListTodo}
          empty="All caught up for this week!"
        />
        <TaskList
          title="Upcoming"
          items={p.upcoming_tasks}
          icon={CalendarClock}
          empty="No upcoming items yet."
        />
        <TaskList
          title="Missed / incomplete weeks"
          items={p.missed_tasks}
          icon={AlertCircle}
          empty="You're on track — no missed weeks."
          variant="warn"
        />
      </div>
    </div>
  );
}
