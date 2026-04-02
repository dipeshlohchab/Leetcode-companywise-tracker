'use client';
import { useState, useMemo } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { useBookmarks } from '@/hooks/useQueries';
import { QuestionRow } from '@/components/questions/QuestionRow';
import { SkeletonRow, EmptyState } from '@/components/ui';
import type { Difficulty, ProgressStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = useBookmarks();
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'All'>('All');

  const filtered = useMemo(() => {
    if (!bookmarks) return [];
    return bookmarks.filter((q: any) => {
      const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase());
      const matchDiff = diffFilter === 'All' || q.difficulty === diffFilter;
      return matchSearch && matchDiff;
    });
  }, [bookmarks, search, diffFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Bookmark className="w-7 h-7 text-brand-400" />
          Bookmarks
        </h1>
        <p className="text-slate-400 text-sm mt-1">{bookmarks?.length ?? 0} saved questions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-8 pr-4 py-2 text-sm rounded-xl bg-surface-700 border border-white/5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/30 transition-all"
          />
        </div>
        <div className="flex gap-1">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
            <button key={d} onClick={() => setDiffFilter(d)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                diffFilter === d
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-surface-700 text-slate-400 hover:text-white border border-transparent'
              )}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {isLoading ? (
          <div>{Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : filtered.length > 0 ? (
          <>
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-white/2">
              <span className="w-24 text-xs text-slate-500 font-medium">Status</span>
              <span className="flex-1 text-xs text-slate-500 font-medium">Question</span>
              <span className="w-20 text-xs text-slate-500 font-medium">Difficulty</span>
              <span className="w-20 text-xs text-slate-500 font-medium text-right">Actions</span>
            </div>
            {filtered.map((q: any) => (
              <QuestionRow key={q._id} question={q} bookmarked={true} />
            ))}
          </>
        ) : (
          <EmptyState
            icon="🔖"
            title={bookmarks?.length === 0 ? "No bookmarks yet" : "No matches"}
            description={bookmarks?.length === 0
              ? "Bookmark questions using the bookmark icon to save them here for later."
              : "Try different search terms or filters."
            }
          />
        )}
      </div>
    </div>
  );
}
