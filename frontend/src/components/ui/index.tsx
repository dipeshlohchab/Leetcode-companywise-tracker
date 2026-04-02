'use client';
import { cn } from '@/lib/utils';

// ── Skeleton ──────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-surface-700 shimmer animate-pulse', className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-white/5">
      <Skeleton className="w-16 h-5 rounded-full" />
      <Skeleton className="flex-1 h-4" />
      <Skeleton className="w-20 h-7 rounded-lg" />
      <Skeleton className="w-8 h-8 rounded-lg" />
    </div>
  );
}

// ── Progress Bar ───────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ value, max, className, showLabel = false, color = 'bg-brand-500', size = 'md' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{value} / {max} solved</span>
          <span className="font-medium text-slate-400">{pct}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-surface-700 overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Stats Card ─────────────────────────────────────────────────
interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: number;
  color?: string;
  className?: string;
}

export function StatsCard({ label, value, sub, icon, trend, color = 'text-brand-400', className }: StatsCardProps) {
  return (
    <div className={cn('glass rounded-2xl p-5 space-y-3 group hover:border-white/10 transition-all', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        {icon && <div className="text-slate-500 group-hover:text-slate-400 transition-colors">{icon}</div>}
      </div>
      <div>
        <p className={cn('text-3xl font-display font-bold', color)}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% this week</span>
        </div>
      )}
    </div>
  );
}

// ── Difficulty Badge ───────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Unknown';

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const map: Record<Difficulty, string> = {
    Easy:    'difficulty-easy',
    Medium:  'difficulty-medium',
    Hard:    'difficulty-hard',
    Unknown: 'text-slate-400 bg-slate-400/10 border border-slate-400/25 rounded-full px-2.5 py-0.5 text-xs font-medium',
  };
  return <span className={map[difficulty]}>{difficulty}</span>;
}

// ── Status Badge ───────────────────────────────────────────────
type Status = 'solved' | 'attempted' | 'not_attempted';

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; className: string }> = {
    solved:        { label: '✓ Solved',       className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    attempted:     { label: '⏳ Attempted',    className: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    not_attempted: { label: '○ Unsolved',      className: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
  };
  const cfg = map[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cfg.className)}>
      {cfg.label}
    </span>
  );
}

// ── Empty State ────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <span className="text-5xl">{icon}</span>
      <p className="text-white font-semibold text-lg">{title}</p>
      {description && <p className="text-slate-500 text-sm max-w-xs">{description}</p>}
    </div>
  );
}
