'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn, getCompanyInitials, getCompanyColor } from '@/lib/utils';
import { ProgressBar } from '@/components/ui';
import type { CompanyProgress } from '@/types';

interface CompanyProgressListProps {
  companies: CompanyProgress[];
  limit?: number;
}

export function CompanyProgressList({ companies, limit }: CompanyProgressListProps) {
  const shown = limit ? companies.slice(0, limit) : companies;

  return (
    <div className="space-y-2">
      {shown.map((c, i) => (
        <Link
          key={c.company}
          href={`/company/${encodeURIComponent(c.company)}`}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className={cn(
            'w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br',
            getCompanyColor(c.company)
          )}>
            {getCompanyInitials(c.company)}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-300 group-hover:text-white truncate transition-colors">
                {c.company}
              </span>
              <span className="text-xs text-slate-500 shrink-0">
                {c.solved}/{c.total}
              </span>
            </div>
            <ProgressBar value={c.solved} max={c.total} size="sm"
              color={c.percentage >= 75 ? 'bg-emerald-500' : c.percentage >= 40 ? 'bg-brand-500' : 'bg-slate-600'}
            />
          </div>

          <div className="shrink-0 text-right">
            <span className={cn(
              'text-xs font-bold',
              c.percentage >= 75 ? 'text-emerald-400' : c.percentage >= 40 ? 'text-brand-400' : 'text-slate-500'
            )}>
              {c.percentage}%
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      ))}
    </div>
  );
}
