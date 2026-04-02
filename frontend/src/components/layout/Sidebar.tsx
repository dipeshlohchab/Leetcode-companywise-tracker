'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  Code2, LayoutDashboard, Building2, Bookmark,
  Settings, LogOut, X, ChevronRight, Flame, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useCompanies } from '@/hooks/useQueries';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/company',   icon: Building2,       label: 'Companies' },
  { href: '/bookmarks', icon: Bookmark,        label: 'Bookmarks' },
];

interface SidebarProps { open: boolean; onClose: () => void; }

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: companies } = useCompanies();
  const [search, setSearch] = useState('');

  const filtered = companies?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/auth/login');
  };

  return (
    <aside className={cn(
      'fixed top-0 left-0 h-full w-64 bg-surface-800 border-r border-white/5 flex flex-col z-40',
      'transition-transform duration-300 lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
            <Code2 className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">DSA Tracker</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white transition-colors p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>{user?.streak?.current ?? 0} day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="p-3 space-y-0.5 border-b border-white/5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            )}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Companies list */}
      <div className="flex-1 overflow-hidden flex flex-col p-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Companies</p>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-surface-700 border border-white/5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/30"
          />
        </div>
        <div className="overflow-y-auto no-scrollbar space-y-0.5 flex-1">
          {filtered?.map(company => (
            <Link
              key={company.name}
              href={`/company/${encodeURIComponent(company.name)}`}
              onClick={onClose}
              className={cn(
                'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all group',
                pathname === `/company/${encodeURIComponent(company.name)}`
                  ? 'bg-brand-500/15 text-brand-300'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              )}
            >
              <span className="truncate">{company.name}</span>
              <span className="text-slate-600 group-hover:text-slate-500 ml-1 shrink-0">{company.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-0.5">
        <Link href="/settings" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4" />Settings
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all">
          <LogOut className="w-4 h-4" />Log out
        </button>
      </div>
    </aside>
  );
}
