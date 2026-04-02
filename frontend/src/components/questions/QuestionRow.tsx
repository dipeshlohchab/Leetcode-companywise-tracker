'use client';
import { useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Check, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DifficultyBadge } from '@/components/ui';
import { useUpdateProgress, useToggleBookmark } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/auth.store';
import type { Question, ProgressStatus } from '@/types';
import toast from 'react-hot-toast';

interface QuestionRowProps {
  question: Question;
  bookmarked?: boolean;
}

const STATUS_CYCLE: ProgressStatus[] = ['not_attempted', 'attempted', 'solved'];

export function QuestionRow({ question, bookmarked = false }: QuestionRowProps) {
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(question.userNotes ?? '');
  const [noteDirty, setNoteDirty] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);

  const updateProgress = useUpdateProgress();
  const toggleBookmark = useToggleBookmark();

  const currentStatus: ProgressStatus = question.userStatus ?? 'not_attempted';

  const statusMeta: Record<ProgressStatus, { icon: React.ReactNode; label: string; next: ProgressStatus; color: string; bg: string }> = {
    not_attempted: {
      icon: <Circle className="w-3.5 h-3.5" />, label: 'Not done',
      next: 'attempted', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20'
    },
    attempted: {
      icon: <Clock className="w-3.5 h-3.5" />, label: 'Attempted',
      next: 'solved', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20 hover:bg-amber-400/20'
    },
    solved: {
      icon: <Check className="w-3.5 h-3.5" />, label: 'Solved',
      next: 'not_attempted', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20'
    },
  };

  const meta = statusMeta[currentStatus];

  const handleStatusToggle = async () => {
    if (!user) { toast.error('Please login to track progress.'); return; }
    try {
      await updateProgress.mutateAsync({ questionId: question._id, status: meta.next });
      toast.success(meta.next === 'solved' ? '🎉 Marked as solved!' : `Marked as ${meta.next}`);
    } catch {
      toast.error('Failed to update. Try again.');
    }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error('Please login to bookmark.'); return; }
    setIsBookmarked(b => !b);
    try {
      await toggleBookmark.mutateAsync(question._id);
    } catch {
      setIsBookmarked(b => !b);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateProgress.mutateAsync({ questionId: question._id, status: currentStatus, notes });
      setNoteDirty(false);
      toast.success('Notes saved!');
    } catch {
      toast.error('Failed to save notes.');
    }
  };

  return (
    <div className={cn(
      'border-b border-white/5 transition-colors',
      currentStatus === 'solved' ? 'bg-emerald-500/3' : '',
      'hover:bg-white/3'
    )}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Status button */}
        <button
          onClick={handleStatusToggle}
          disabled={updateProgress.isPending}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all',
            meta.color, meta.bg
          )}
          title={`Click to mark as ${meta.next}`}
        >
          {updateProgress.isPending
            ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            : meta.icon
          }
          <span className="hidden sm:inline">{meta.label}</span>
        </button>

        {/* Title */}
        <a
          href={question.link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex-1 text-sm font-medium transition-colors hover:text-brand-300 flex items-center gap-1.5 min-w-0 group',
            currentStatus === 'solved' ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200'
          )}
        >
          <span className="truncate">{question.title}</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
        </a>

        {/* Difficulty */}
        <div className="shrink-0 hidden sm:block">
          <DifficultyBadge difficulty={question.difficulty} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleBookmark}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              isBookmarked
                ? 'text-brand-400 bg-brand-400/10 hover:bg-brand-400/20'
                : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
            )}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
            title="Notes"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notes panel */}
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="pl-[90px] sm:pl-[102px] space-y-2">
            <div className="sm:hidden mb-2">
              <DifficultyBadge difficulty={question.difficulty} />
            </div>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); setNoteDirty(true); }}
              placeholder="Add notes, approach, or links here..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-700 border border-white/5 text-slate-300 text-sm placeholder:text-slate-600 focus:outline-none focus:border-brand-500/30 resize-none transition-all"
            />
            {noteDirty && (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-xs font-medium transition-all"
                >
                  Save notes
                </button>
                <button
                  onClick={() => { setNotes(question.userNotes ?? ''); setNoteDirty(false); }}
                  className="px-3 py-1.5 rounded-lg bg-surface-700 hover:bg-surface-600 text-slate-400 text-xs font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
