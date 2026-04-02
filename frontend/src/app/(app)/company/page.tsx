'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Building2, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useCompanies, useCompanyProgress } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/auth.store';
import { cn, getCompanyInitials, getCompanyColor } from '@/lib/utils';
import { Skeleton, ProgressBar } from '@/components/ui';

function CompaniesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [sort, setSort] = useState<'name' | 'count' | 'progress'>('count');

  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: progressData, isLoading: progressLoading } = useCompanyProgress();

  const progressMap = useMemo(() => {
    const m: Record<string, { solved: number; total: number; pct: number }> = {};
    progressData?.forEach(p => {
      m[p.company] = { solved: p.solved, total: p.total, pct: p.percentage };
    });
    return m;
  }, [progressData]);

  const filtered = useMemo(() => {
    if (!companies) return [];
    let list = [...companies];
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'count') return b.count - a.count;
      if (sort === 'progress') {
        const pa = progressMap[a.name]?.pct ?? 0;
        const pb = progressMap[b.name]?.pct ?? 0;
        return pb - pa;
      }
      return 0;
    });
    return list;
  }, [companies, search, sort, progressMap]);

  const TIER_COMPANIES = ['Google', 'Amazon', 'Apple', 'Facebook', 'Microsoft', 'Netflix', 'Uber', 'Airbnb'];
  const featured = companies?.filter(c => TIER_COMPANIES.includes(c.name)) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Companies</h1>
        <p className="text-slate-400 text-sm mt-1">{companies?.length ?? 0} companies · Pick your target and start grinding</p>
      </div>

      {/* FAANG quick access */}
      {!search && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Top Companies
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {featured.map(c => {
              const prog = progressMap[c.name];
              return (
                <Link key={c.name} href={`/company/${encodeURIComponent(c.name)}`}
                  className="glass rounded-xl p-3 text-center hover:border-white/15 transition-all group space-y-2">
                  <div className={cn('w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br', getCompanyColor(c.name))}>
                    {getCompanyInitials(c.name)}
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-white transition-colors truncate">{c.name}</p>
                  {prog && prog.solved > 0 && (
                    <div className="text-xs text-emerald-400 font-medium">{prog.pct}%</div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-700 border border-white/5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/30 text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
          {(['count', 'name', 'progress'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={cn('px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize',
                sort === s ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-surface-700 text-slate-400 hover:text-white border border-transparent'
              )}>
              {s === 'count' ? 'Questions' : s === 'progress' ? 'Progress' : 'A–Z'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {companiesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array(20).fill(0).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((company, i) => {
            const prog = progressMap[company.name];
            const solved = prog?.solved ?? 0;
            const pct = prog?.pct ?? 0;
            return (
              <Link key={company.name} href={`/company/${encodeURIComponent(company.name)}`}
                className="glass rounded-2xl p-4 hover:border-white/15 transition-all group space-y-3 animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br shrink-0', getCompanyColor(company.name))}>
                    {getCompanyInitials(company.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">{company.name}</p>
                    <p className="text-xs text-slate-500">{company.count} questions</p>
                  </div>
                  {solved > 0 && (
                    <span className="ml-auto text-xs font-bold text-emerald-400 shrink-0">{pct}%</span>
                  )}
                </div>
                <ProgressBar value={solved} max={company.count} size="sm"
                  color={pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-brand-500' : 'bg-surface-600'} />
              </Link>
            );
          })}
        </div>
      )}

      {!companiesLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-white font-medium">No companies found</p>
          <p className="text-slate-500 text-sm">Try a different search term</p>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mt-20" />}>
      <CompaniesContent />
    </Suspense>
  );
}
