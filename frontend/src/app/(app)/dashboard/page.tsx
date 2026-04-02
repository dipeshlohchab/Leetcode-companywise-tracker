'use client';
import { useAuthStore } from '@/store/auth.store';
import { useCompanyProgress, useActivity, useDailyStats, useProgress } from '@/hooks/useQueries';
import { StatsCard, SkeletonCard, SkeletonRow, EmptyState } from '@/components/ui';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { CompanyProgressList } from '@/components/dashboard/CompanyProgressList';
import { formatRelativeTime, statusConfig, difficultyConfig } from '@/lib/utils';
import { Trophy, Target, Flame, Zap, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: globalStats, isLoading: statsLoading } = useProgress();
  const { data: companyProgress, isLoading: companyLoading } = useCompanyProgress();
  const { data: activity, isLoading: activityLoading } = useActivity();
  const { data: dailyStats, isLoading: heatmapLoading } = useDailyStats();

  const topCompanies = companyProgress?.filter(c => c.solved > 0).slice(0, 8) ?? [];
  const allCompaniesStarted = companyProgress?.filter(c => c.solved > 0 || c.attempted > 0).length ?? 0;

  const overallPct = globalStats
    ? Math.round((globalStats.solved / Math.max(globalStats.total, 1)) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's your prep progress at a glance.</p>
        </div>
        <Link
          href="/company"
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium transition-all shadow-lg shadow-brand-500/20"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Practice</span>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatsCard
              label="Total Solved"
              value={globalStats?.solved ?? 0}
              sub={`of ${globalStats?.total ?? 0} problems`}
              icon={<Trophy className="w-5 h-5" />}
              color="text-brand-400"
            />
            <StatsCard
              label="Completion"
              value={`${overallPct}%`}
              sub="overall progress"
              icon={<Target className="w-5 h-5" />}
              color="text-violet-400"
            />
            <StatsCard
              label="Current Streak"
              value={user?.streak?.current ?? 0}
              sub={`Best: ${user?.streak?.longest ?? 0} days`}
              icon={<Flame className="w-5 h-5" />}
              color="text-orange-400"
            />
            <StatsCard
              label="Companies Started"
              value={allCompaniesStarted}
              sub="companies in progress"
              icon={<TrendingUp className="w-5 h-5" />}
              color="text-emerald-400"
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
        {/* Left col: heatmap + company progress */}
        <div className="lg:col-span-3 space-y-4">
          {/* Heatmap */}
          <div className="glass rounded-2xl p-5">
            {heatmapLoading
              ? <div className="h-24 shimmer rounded-xl" />
              : <ActivityHeatmap data={dailyStats ?? []} />
            }
          </div>

          {/* Company Progress */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-white">Company Progress</h2>
              <Link href="/company" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {companyLoading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => <div key={i} className="h-10 shimmer rounded-xl" />)}
              </div>
            ) : topCompanies.length > 0 ? (
              <CompanyProgressList companies={topCompanies} limit={8} />
            ) : (
              <EmptyState icon="🏢" title="No progress yet" description="Start solving problems from any company to see your progress here." />
            )}
          </div>
        </div>

        {/* Right col: recent activity */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="font-display font-semibold text-white">Recent Activity</h2>
            </div>
            {activityLoading ? (
              <div className="space-y-3">
                {Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : (activity?.length ?? 0) > 0 ? (
              <div className="space-y-1 -mx-2">
                {activity!.map((item) => {
                  const q = item.questionId as any;
                  const sc = statusConfig[item.status as keyof typeof statusConfig];
                  const dc = q?.difficulty ? difficultyConfig[q.difficulty as keyof typeof difficultyConfig] : null;
                  return (
                    <Link
                      key={item._id}
                      href={q?.link ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${sc.bg} ${sc.color}`}>
                        {sc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 group-hover:text-white truncate transition-colors">{q?.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {dc && <span className={`text-xs ${dc.color}`}>{q?.difficulty}</span>}
                          <span className="text-xs text-slate-600">·</span>
                          <span className="text-xs text-slate-600">{formatRelativeTime(item.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="⚡" title="No activity yet" description="Mark your first question as solved to see activity here." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
