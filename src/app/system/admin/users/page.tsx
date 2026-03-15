'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, RefreshCw } from 'lucide-react';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,       color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/30',  dot: 'bg-amber-400' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-400' },
  rejected: { label: 'Rejected', icon: XCircle,     color: 'text-red-500 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-900/30',    dot: 'bg-red-400' },
};

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  async function fetchProfiles() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load users.');
      } else {
        setProfiles(data.profiles ?? []);
      }
    } catch {
      setError('Network error. Could not load users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    setActionLoading(userId + action);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error ?? 'Action failed.');
      } else {
        setToast(data.message);
        await fetchProfiles();
      }
    } catch {
      setToast('Network error.');
    } finally {
      setActionLoading(null);
      setTimeout(() => setToast(''), 4000);
    }
  }

  useEffect(() => { fetchProfiles(); }, []);

  const filtered = profiles.filter(p => filter === 'all' || p.status === filter);
  const counts = {
    all: profiles.length,
    pending: profiles.filter(p => p.status === 'pending').length,
    approved: profiles.filter(p => p.status === 'approved').length,
    rejected: profiles.filter(p => p.status === 'rejected').length,
  };

  function fmtDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div>
        {/* Page title & Refresh button */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">User Approvals</p>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">User Management</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">Review and approve or reject access requests.</p>
          </div>
          <button
            onClick={fetchProfiles}
            disabled={loading}
            className="flex items-center gap-2 text-sm bg-card border border-border text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-left rounded-xl p-4 border transition-colors ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-card border-border text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <p className={`text-2xl font-semibold mb-0.5 ${isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {counts[key]}
                </p>
                <p className={`text-[11px] capitalize ${isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {key === 'all' ? 'Total Users' : `${key.charAt(0).toUpperCase() + key.slice(1)}`}
                </p>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading && profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 dark:text-zinc-400">
              <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-500 dark:border-t-zinc-400 rounded-full animate-spin mb-2" />
              <p className="text-sm">Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 dark:text-zinc-400">
              <Users size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No users in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((profile) => {
                const s = STATUS_CONFIG[profile.status];
                const StatusIcon = s.icon;
                return (
                  <div
                    key={profile.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Left: user info */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar initials */}
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {profile.full_name?.charAt(0)?.toUpperCase() ?? profile.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {profile.full_name ?? '—'}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{profile.email}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Registered {fmtDate(profile.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Right: badge + actions */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${s.bg} ${s.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>

                      {/* Role badge */}
                      {profile.role === 'admin' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-900 dark:bg-zinc-700 text-white dark:text-zinc-100">
                          Admin
                        </span>
                      )}

                      {/* Action buttons — only for pending */}
                      {profile.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleAction(profile.id, 'approve')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                          >
                            {actionLoading === profile.id + 'approve' ? (
                              <span className="w-3 h-3 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(profile.id, 'reject')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 bg-transparent border border-border hover:border-red-300 dark:hover:border-red-500/50 hover:text-red-500 disabled:opacity-50 text-zinc-500 dark:text-zinc-400 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                          >
                            {actionLoading === profile.id + 'reject' ? (
                              <span className="w-3 h-3 border border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
