'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, RefreshCw } from 'lucide-react';
import Header from '../../../components/Header';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50',  dot: 'bg-amber-400' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
  rejected: { label: 'Rejected', icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50',    dot: 'bg-red-400' },
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
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <Header />


      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Page title & Refresh button */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="font-medium">User Approvals</span>
            </div>
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">Review and approve or reject access requests.</p>
          </div>
          <button
            onClick={fetchProfiles}
            disabled={loading}
            className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-left rounded-2xl p-5 border transition-all ${
                  isActive
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-100 text-gray-900 hover:border-gray-300'
                }`}
              >
                <p className={`text-3xl font-medium mb-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {counts[key]}
                </p>
                <p className={`text-xs capitalize ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                  {key === 'all' ? 'Total Users' : `${key.charAt(0).toUpperCase() + key.slice(1)}`}
                </p>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading && profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Users size={36} className="mb-3 opacity-40" />
              <p className="text-sm">No users in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((profile) => {
                const s = STATUS_CONFIG[profile.status];
                const StatusIcon = s.icon;
                return (
                  <div
                    key={profile.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Left: user info */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar initials */}
                      <div className="w-10 h-10 rounded-xl bg-[#F0EBD8] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700">
                          {profile.full_name?.charAt(0)?.toUpperCase() ?? profile.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {profile.full_name ?? '—'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Registered {fmtDate(profile.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Right: badge + actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>

                      {/* Role badge */}
                      {profile.role === 'admin' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                          Admin
                        </span>
                      )}

                      {/* Action buttons — only for pending */}
                      {profile.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(profile.id, 'approve')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 bg-[#F5C842] hover:bg-[#EAB308] disabled:opacity-50 text-gray-900 text-xs font-medium px-4 py-2 rounded-full transition-colors"
                          >
                            {actionLoading === profile.id + 'approve' ? (
                              <span className="w-3 h-3 border border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(profile.id, 'reject')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 bg-transparent border border-gray-200 hover:border-red-300 hover:text-red-500 disabled:opacity-50 text-gray-500 text-xs font-medium px-4 py-2 rounded-full transition-colors"
                          >
                            {actionLoading === profile.id + 'reject' ? (
                              <span className="w-3 h-3 border border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                            ) : (
                              <XCircle size={13} />
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
      </main>
    </div>
  );
}
