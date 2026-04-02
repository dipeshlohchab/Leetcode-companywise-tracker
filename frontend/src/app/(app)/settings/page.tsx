'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, LogOut, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { userAPI, authAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty.'); return; }
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({ name });
      setUser({ ...user!, name: data.user.name });
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPass || !newPass) { toast.error('Fill all password fields.'); return; }
    if (newPass.length < 6) { toast.error('New password must be 6+ characters.'); return; }
    setChangingPass(true);
    try {
      await userAPI.updatePassword({ currentPassword: currPass, newPassword: newPass });
      toast.success('Password changed successfully!');
      setCurrPass(''); setNewPass('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    router.push('/auth/login');
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-surface-700 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm";

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Profile section */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
            <User className="w-4 h-4 text-brand-400" />
          </div>
          <h2 className="font-semibold text-white">Profile</h2>
        </div>

        {/* Avatar placeholder */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <p className="text-slate-600 text-xs mt-0.5">
              Member since {new Date(user?.createdAt ?? '').toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Display name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input value={user?.email ?? ''} disabled className={cn(inputClass, 'opacity-50 cursor-not-allowed')} />
            <p className="text-xs text-slate-600">Email cannot be changed.</p>
          </div>
          <button type="submit" disabled={saving || name === user?.name}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
        </form>
      </div>

      {/* Password section */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Lock className="w-4 h-4 text-violet-400" />
          </div>
          <h2 className="font-semibold text-white">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Current password</label>
            <div className="relative">
              <input type={showCurr ? 'text' : 'password'} value={currPass} onChange={e => setCurrPass(e.target.value)}
                placeholder="••••••••" className={cn(inputClass, 'pr-10')} />
              <button type="button" onClick={() => setShowCurr(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showCurr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">New password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="Min. 6 characters" className={cn(inputClass, 'pr-10')} />
              <button type="button" onClick={() => setShowNew(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={changingPass || !currPass || !newPass}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {changingPass ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            Update password
          </button>
        </form>
      </div>

      {/* Stats summary */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-white">Your Stats</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Total Solved', value: user?.totalSolved ?? 0, color: 'text-brand-400' },
            { label: 'Current Streak', value: `${user?.streak?.current ?? 0}d`, color: 'text-orange-400' },
            { label: 'Best Streak', value: `${user?.streak?.longest ?? 0}d`, color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="bg-surface-700 rounded-xl p-3">
              <p className={cn('text-2xl font-display font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-6 border-rose-500/10 space-y-3">
        <h2 className="font-semibold text-rose-400">Danger Zone</h2>
        <p className="text-slate-500 text-sm">Actions here cannot be undone.</p>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium border border-rose-500/20 transition-all">
          <LogOut className="w-4 h-4" />
          Sign out of all devices
        </button>
      </div>
    </div>
  );
}
