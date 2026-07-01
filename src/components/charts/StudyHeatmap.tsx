import { useMemo } from 'react';
import { subDays, format, eachDayOfInterval } from 'date-fns';

interface HeatmapProps {
  data: { date: string; hours: number }[];
}

const LEVELS = ['bg-white/5', 'bg-blue-900/50', 'bg-blue-700/50', 'bg-blue-500/60', 'bg-blue-400'];

export function StudyHeatmap({ data }: HeatmapProps) {
  const map = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.date, d.hours));
    return m;
  }, [data]);

  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 89);
    return eachDayOfInterval({ start, end });
  }, []);

  const getLevel = (hours: number) => {
    if (hours === 0) return 0;
    if (hours < 1) return 1;
    if (hours < 2) return 2;
    if (hours < 4) return 3;
    return 4;
  };

  return (
    <div>
      <div className="grid grid-cols-[repeat(13,1fr)] gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const hours = map.get(key) ?? 0;
          return (
            <div
              key={key}
              title={`${format(day, 'MMM d')}: ${hours}h`}
              className={`aspect-square rounded-sm ${LEVELS[getLevel(hours)]} hover:ring-1 hover:ring-blue-400/50 cursor-default`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-slate-500">
        <span>Less</span>
        {LEVELS.map((l, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${l}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
