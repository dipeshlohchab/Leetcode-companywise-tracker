import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Difficulty, ProgressStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string; border: string }> = {
  Easy:    { label: 'Easy',    color: 'text-emerald-400', bg: 'bg-emerald-400/10',  border: 'border-emerald-400/30' },
  Medium:  { label: 'Medium',  color: 'text-amber-400',   bg: 'bg-amber-400/10',    border: 'border-amber-400/30' },
  Hard:    { label: 'Hard',    color: 'text-rose-400',    bg: 'bg-rose-400/10',     border: 'border-rose-400/30' },
  Unknown: { label: '?',       color: 'text-slate-400',   bg: 'bg-slate-400/10',    border: 'border-slate-400/30' },
};

export const statusConfig: Record<ProgressStatus, { label: string; color: string; bg: string; icon: string }> = {
  solved:        { label: 'Solved',       color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: '✓' },
  attempted:     { label: 'Attempted',    color: 'text-amber-400',   bg: 'bg-amber-400/10',   icon: '⏳' },
  not_attempted: { label: 'Not Attempted', color: 'text-slate-400',  bg: 'bg-slate-400/10',   icon: '○' },
};

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function getCompanyInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function getCompanyColor(name: string): string {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-violet-500 to-purple-700',
    'from-emerald-500 to-green-700',
    'from-orange-500 to-amber-700',
    'from-rose-500 to-red-700',
    'from-cyan-500 to-sky-700',
    'from-pink-500 to-fuchsia-700',
    'from-indigo-500 to-blue-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
