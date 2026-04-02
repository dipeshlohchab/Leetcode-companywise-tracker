'use client';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { DailyStat } from '@/types';

interface HeatmapProps { data: DailyStat[]; }

export function ActivityHeatmap({ data }: HeatmapProps) {
  const cells = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => { map[d._id] = d.count; });

    const today = new Date();
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: map[key] || 0, day: d.toLocaleDateString('en', { weekday: 'short' })[0] });
    }
    return result;
  }, [data]);

  const maxCount = Math.max(...cells.map(c => c.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-surface-700';
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 'bg-brand-900 border-brand-700/40';
    if (ratio <= 0.5)  return 'bg-brand-700 border-brand-500/40';
    if (ratio <= 0.75) return 'bg-brand-600 border-brand-400/40';
    return 'bg-brand-500 border-brand-300/40';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-300">Activity — Last 30 days</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Less</span>
          {['bg-surface-700', 'bg-brand-900', 'bg-brand-700', 'bg-brand-500'].map(c => (
            <div key={c} className={cn('w-3 h-3 rounded-sm', c)} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-1.5">
        {cells.map(cell => (
          <div
            key={cell.date}
            title={`${cell.date}: ${cell.count} solved`}
            className={cn(
              'aspect-square rounded-sm border border-transparent cursor-default transition-all hover:scale-110',
              getColor(cell.count)
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>{cells[0]?.date}</span>
        <span>{cells[cells.length - 1]?.date}</span>
      </div>
    </div>
  );
}
