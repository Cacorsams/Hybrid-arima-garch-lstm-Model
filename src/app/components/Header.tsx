'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';

interface HeaderProps {
  activePage?: 'home' | 'about' | 'dashboard';
}

export default function Header({ activePage }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'User';
        setUser({ name, email: user.email ?? '' });
      }
    }
    loadUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setDropdownOpen(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/signin');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  // Generate initials from name
  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // Deterministic warm hue from name
  function getAvatarColor(name: string) {
    const colors = [
      'bg-amber-400 text-amber-900',
      'bg-orange-400 text-orange-900',
      'bg-yellow-400 text-yellow-900',
      'bg-lime-500 text-lime-900',
      'bg-teal-400 text-teal-900',
      'bg-sky-400 text-sky-900',
      'bg-violet-400 text-violet-900',
      'bg-rose-400 text-rose-900',
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }

  const initials = user ? getInitials(user.name) : '?';
  const avatarColor = user ? getAvatarColor(user.name) : 'bg-gray-200 text-gray-600';

  const navLinks = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/models', label: 'About', key: 'about' },
    { href: '/system/dashboard', label: 'Dashboard', key: 'dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#f5f0eb]/95 backdrop-blur-sm border-b border-[#e0dbd5]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold text-[#1a1a1a] tracking-tight font-serif"
        >
          QuantForecast®
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-[#555]">
          {navLinks.map(({ href, label, key }) => (
            <li key={key}>
              <Link
                href={href}
                className={
                  activePage === key
                    ? 'text-[#1a1a1a] font-bold border-b-2 border-[#1a1a1a] pb-1'
                    : 'hover:text-[#1a1a1a] transition-colors duration-200'
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: avatar + dropdown */}
        <div className="flex items-center gap-3">

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar button */}
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2.5 group focus:outline-none"
                aria-label="User menu"
              >
                {/* Animated circular avatar */}
                <div className="relative">
                  {/* Spinning ring */}
                  <div className={`absolute inset-0 rounded-full ${
                    dropdownOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity duration-300`}>
                    <div className="w-full h-full rounded-full border-2 border-dashed border-[#1a1a1a]/20 animate-spin [animation-duration:6s]" />
                  </div>
                  {/* Avatar circle */}
                  <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold select-none transition-transform duration-200 group-hover:scale-110 ${avatarColor}`}>
                    {initials}
                  </div>
                </div>

                {/* Name — hidden on mobile */}
                <span className="hidden md:block text-sm font-medium text-[#1a1a1a] max-w-[120px] truncate">
                  {user.name}
                </span>

                {/* Chevron */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`hidden md:block text-[#888] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl border border-[#e0dbd5] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User info */}
                  <div className="px-4 py-4 border-b border-[#f0ede8]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor}`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{user.name}</p>
                        <p className="text-xs text-[#888] truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <Link
                      href="/system/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#555] hover:bg-[#f9f7f5] hover:text-[#1a1a1a] transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      Dashboard
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-[#f0ede8] py-1">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {loggingOut ? (
                        <span className="w-4 h-4 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                      )}
                      {loggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Skeleton while loading */
            <div className="w-9 h-9 rounded-full bg-[#e0dbd5] animate-pulse" />
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-[#1a1a1a] p-2"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e0dbd5] bg-[#f5f0eb] px-6 py-4 space-y-1">
          {navLinks.map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2.5 text-sm ${
                activePage === key
                  ? 'text-[#1a1a1a] font-bold'
                  : 'text-[#555] hover:text-[#1a1a1a]'
              } transition-colors`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#e0dbd5]">
            {user && (
              <div className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor}`}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{user.name}</p>
                  <p className="text-xs text-[#888] truncate">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full text-left py-2.5 text-sm text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {loggingOut ? 'Signing out…' : '→ Sign out'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
