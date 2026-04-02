'use client';
import { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useQuestions, useProgress, useBookmarks } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/auth.store';
import { QuestionRow } from '@/components/questions/QuestionRow';
import { ProgressBar, SkeletonRow, EmptyState } from '@/components/ui';
import { cn, getCompanyInitials, getCompanyColor, difficultyConfig } from '@/lib/utils';
import type { Difficulty, ProgressStatus } from '@/types';

type Props = {
  params: { name: string };
};

const DIFFICULTIES: (Difficulty | 'All')[] = ['All', 'Easy', 'Medium', 'Hard'];
const STATUSES: { value: ProgressStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'solved', label: '✓ Solved' },
  { value: 'attempted', label: '⏳ Attempted' },
  { value: 'not_attempted', label: '○ Unsolved' },
];

export default function CompanyPage({ params }: Props) {
  const { name } = params;
  const company = decodeURIComponent(name);
  const router = useRouter();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuestions({
    company,
    difficulty: difficulty === 'All' ? undefined : difficulty,
    search: search || undefined,
    page,
    limit: 50,
  });

  const { data: progressStats } = useProgress({ company });
  const { data: bookmarks } = useBookmarks();

  const bookmarkIds = useMemo(() => new Set(bookmarks?.map((b: any) => b._id) ?? []), [bookmarks]);

  const filteredQuestions = useMemo(() => {
    if (!data?.questions) return [];
    if (statusFilter === 'all') return data.questions;
    return data.questions.filter(q => (q.userStatus ?? 'not_attempted') === statusFilter);
  }, [data?.questions, statusFilter]);

  const total = progressStats?.total ?? data?.pagination?.total ?? 0;
  const solved = progressStats?.solved ?? 0;
  const attempted = progressStats?.attempted ?? 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.back()}
          className="mt-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br shrink-0', getCompanyColor(company))}>
              {getCompanyInitials(company)}
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-white">{company}</h1>
              <p className="text-slate-400 text-sm">{total} questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {user && (
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <span className="text-emerald-400 font-medium">{solved} solved</span>
              <span className="text-amber-400 font-medium">{attempted} attempted</span>
              <span className="text-slate-500">{total - solved - attempted} left</span>
            </div>
            <span className="text-slate-400 font-bold">{total > 0 ? Math.round((solved / total) * 100) : 0}%</span>
          </div>
          <ProgressBar value={solved} max={total} size="md"
            color={solved / total >= 0.75 ? 'bg-emerald-500' : 'bg-brand-500'} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search questions..."
            className="w-full pl-8 pr-4 py-2 text-sm rounded-xl bg-surface-700 border border-white/5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/30 transition-all"
          />
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1">
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => { setDifficulty(d); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                difficulty === d
                  ? d === 'All' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : `${difficultyConfig[d as Difficulty].bg} ${difficultyConfig[d as Difficulty].color} border ${difficultyConfig[d as Difficulty].border}`
                  : 'bg-surface-700 text-slate-400 hover:text-white border border-transparent'
              )}>
              {d}
            </button>
          ))}
        </div>

        {/* Status filter */}
        {user && (
          <div className="flex gap-1">
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => setStatusFilter(s.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  statusFilter === s.value
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-surface-700 text-slate-400 hover:text-white border border-transparent'
                )}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {isFetching && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin ml-1" />}
      </div>

      {/* Question count */}
      <p className="text-xs text-slate-500">
        Showing {filteredQuestions.length} {statusFilter !== 'all' ? statusFilter.replace('_', ' ') : ''} questions
        {search && ` matching "${search}"`}
      </p>

      {/* Questions list */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-white/2">
          <span className="w-24 text-xs text-slate-500 font-medium">Status</span>
          <span className="flex-1 text-xs text-slate-500 font-medium">Question</span>
          <span className="w-20 text-xs text-slate-500 font-medium">Difficulty</span>
          <span className="w-20 text-xs text-slate-500 font-medium text-right">Actions</span>
        </div>

        {isLoading ? (
          <div>{Array(10).fill(0).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : filteredQuestions.length > 0 ? (
          <>
            {filteredQuestions.map(q => (
              <QuestionRow key={q._id} question={q} bookmarked={bookmarkIds.has(q._id)} />
            ))}
          </>
        ) : (
          <EmptyState
            icon="🔍"
            title="No questions found"
            description={search ? `Try a different search term` : `No ${statusFilter !== 'all' ? statusFilter : ''} questions for current filters`}
          />
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && !statusFilter || false ? (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-surface-700 text-slate-400 text-sm hover:text-white disabled:opacity-30 transition-all">
            Previous
          </button>
          <span className="text-slate-500 text-sm px-2">
            Page {page} of {data.pagination.pages}
          </span>
          <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages}
            className="px-4 py-2 rounded-lg bg-surface-700 text-slate-400 text-sm hover:text-white disabled:opacity-30 transition-all">
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
