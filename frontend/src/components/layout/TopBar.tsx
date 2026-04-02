'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Moon, Sun, Bell, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

interface TopBarProps { onMenuClick: () => void; }

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/company?search=${encodeURIComponent(search.trim())}`);
      setSearching(false);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-surface-800/90 backdrop-blur-md border-b border-white/5 flex items-center gap-3 px-4 md:px-6">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white transition-colors p-1">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions or companies..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-surface-700 border border-white/5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/30 focus:bg-surface-700 transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Streak badge */}
        {(user?.streak?.current ?? 0) > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-400/10 border border-orange-400/20">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-semibold text-orange-400">{user?.streak?.current}</span>
          </div>
        )}

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0 cursor-pointer select-none"
          title={user?.name}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
