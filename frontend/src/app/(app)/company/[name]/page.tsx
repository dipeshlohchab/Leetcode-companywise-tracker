'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, RefreshCw } from 'lucide-react';

import { useQuestions, useProgress, useBookmarks } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/auth.store';
import { QuestionRow } from '@/components/questions/QuestionRow';
import { ProgressBar, SkeletonRow, EmptyState } from '@/components/ui';
import { cn, getCompanyInitials, getCompanyColor } from '@/lib/utils';
import type { Difficulty, ProgressStatus } from '@/types';

type Props = {
  params: { name: string };
};

// ✅ FIXED: match QuestionRow expected structure
type Question = {
  _id: string;
  title: string;
  titleSlug?: string;
  link: string;
  difficulty: Difficulty;
  companies: string[];
  tags?: string[];
  frequency?: number;
  userStatus?: 'solved' | 'attempted' | 'not_attempted';
};

type Bookmark = {
  _id: string;
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
  const company = useMemo(() => decodeURIComponent(name), [name]);

  const router = useRouter();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  // ✅ FIX: removed generic
  const { data, isLoading, isFetching } = useQuestions({
    company,
    difficulty: difficulty === 'All' ? undefined : difficulty,
    search: search || undefined,
    page,
    limit: 50,
  });

  const { data: progressStats } = useProgress({ company });
  const { data: bookmarks } = useBookmarks();

  const bookmarkIds = useMemo(
    () => new Set(bookmarks?.map((b: Bookmark) => b._id) ?? []),
    [bookmarks]
  );

  // ✅ FIX: typed q
  const filteredQuestions: Question[] = useMemo(() => {
    if (!data?.questions) return [];
    if (statusFilter === 'all') return data.questions;

    return data.questions.filter(
      (q: Question) => (q.userStatus ?? 'not_attempted') === statusFilter
    );
  }, [data?.questions, statusFilter]);

  const total = progressStats?.total ?? data?.pagination?.total ?? 0;
  const solved = progressStats?.solved ?? 0;
  const attempted = progressStats?.attempted ?? 0;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br',
              getCompanyColor(company)
            )}
          >
            {getCompanyInitials(company)}
          </div>

          <div>
            <h1 className="font-display text-xl font-bold text-white">
              {company}
            </h1>
            <p className="text-slate-400 text-sm">{total} questions</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      {user && (
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex gap-4">
              <span className="text-emerald-400">{solved} solved</span>
              <span className="text-amber-400">{attempted} attempted</span>
              <span className="text-slate-500">{total - solved - attempted} left</span>
            </div>
            <span className="text-slate-400 font-bold">
              {total > 0 ? Math.round((solved / total) * 100) : 0}%
            </span>
          </div>

          <ProgressBar value={solved} max={total} />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search..."
          className="px-3 py-2 rounded bg-surface-700 text-sm"
        />

        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              setPage(1);
            }}
            className={cn(
              'px-3 py-1 text-xs rounded',
              difficulty === d ? 'bg-brand-500 text-white' : 'bg-surface-700'
            )}
          >
            {d}
          </button>
        ))}

        {user &&
          STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                'px-3 py-1 text-xs rounded',
                statusFilter === s.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-700'
              )}
            >
              {s.label}
            </button>
          ))}

        {isFetching && <RefreshCw className="w-4 h-4 animate-spin" />}
      </div>

      {/* List */}
      <div className="glass rounded-2xl">

        {isLoading ? (
          <div>
            {Array(10).fill(0).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <QuestionRow
              key={q._id}
               question={{
                ...q,
                titleSlug: q.titleSlug ?? q.title.toLowerCase().replace(/\s+/g, '-'),
                tags: q.tags ?? [],
                frequency: q.frequency ?? 0,
              }}
              bookmarked={bookmarkIds.has(q._id)}
            />
          ))
        ) : (
          // ✅ FIX: added required icon
          <EmptyState icon="🔍" title="No questions found" />
        )}
      </div>

      {/* Pagination */}
      {data?.pagination &&
        data.pagination.pages > 1 &&
        statusFilter === 'all' && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            <span>
              {page} / {data.pagination.pages}
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(data.pagination.pages, p + 1))
              }
              disabled={page === data.pagination.pages}
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}