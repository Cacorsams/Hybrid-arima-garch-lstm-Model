'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

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
  }, [supabase.auth]);

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

  // Deterministic avatar URL from name
  function getAvatarUrl(name: string) {
    const bgColors = [
      'ffdfbf', // peach
      'f5c842', // brand yellow
      'fcdba1', // yellow-orange
      'f5ebcf', // light cream
      'e8d5b5', // tan
      'ffd1a8', // light orange
      'f2c89d', // muted orange
      'e3cfac', // muted gold
    ];
    const idx = name.charCodeAt(0) % bgColors.length;
    const bg = bgColors[idx];
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg}`;
  }

  const avatarUrl = user ? getAvatarUrl(user.name) : '';

  const navLinks = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/models', label: 'About', key: 'about' },
    { href: '/system/dashboard', label: 'Dashboard', key: 'dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#f5f0eb]/95 dark:bg-[#121212]/95 backdrop-blur-sm border-b border-[#e0dbd5] dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white tracking-tight font-serif"
        >
          QuantForecast®
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-[#555] dark:text-gray-400">
          {navLinks.map(({ href, label, key }) => (
            <li key={key}>
              <Link
                href={href}
                className={
                  activePage === key
                    ? 'text-[#1a1a1a] dark:text-white font-bold border-b-2 border-[#1a1a1a] dark:border-white pb-1'
                    : 'hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-200'
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
                    <div className="w-full h-full rounded-full border-2 border-dashed border-[#1a1a1a]/20 dark:border-white/20 animate-spin [animation-duration:6s]" />
                  </div>
                  {/* Avatar circle */}
                  <div className="relative w-9 h-9 rounded-full flex items-center justify-center select-none transition-transform duration-200 group-hover:scale-110 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Name — hidden on mobile */}
                <span className="hidden md:block text-sm font-medium text-[#1a1a1a] dark:text-white max-w-[120px] truncate">
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
                  className={`hidden md:block text-[#888] dark:text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-[#e0dbd5] dark:border-gray-800 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User info */}
                  <div className="px-4 py-4 border-b border-[#f0ede8] dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-[#888] dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <Link
                      href="/system/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#555] dark:text-gray-300 hover:bg-[#f9f7f5] dark:hover:bg-gray-800 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      Dashboard
                    </Link>

                    {/* Theme Toggle */}
                    {mounted && (
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#555] dark:text-gray-300 hover:bg-[#f9f7f5] dark:hover:bg-gray-800 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                        </div>
                        {/* Toggle Pill */}
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-[#f5c842]' : 'bg-gray-300'}`}>
                          <div className={`w-3 h-3 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-[#f0ede8] dark:border-gray-800 py-1">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
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
            <div className="w-9 h-9 rounded-full bg-[#e0dbd5] dark:bg-gray-800 animate-pulse" />
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-[#1a1a1a] dark:text-white p-2"
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
        <div className="md:hidden border-t border-[#e0dbd5] dark:border-gray-800 bg-[#f5f0eb] dark:bg-[#121212] px-6 py-4 space-y-1">
          {navLinks.map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2.5 text-sm ${
                activePage === key
                  ? 'text-[#1a1a1a] dark:text-white font-bold'
                  : 'text-[#555] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white'
              } transition-colors`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#e0dbd5] dark:border-gray-800">
            {user && (
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-[#888] dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}
            {/* Mobile Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center justify-between py-2.5 text-sm text-[#555] dark:text-gray-300 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-[#f5c842]' : 'bg-gray-300'}`}>
                   <div className={`w-3 h-3 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full text-left py-2.5 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {loggingOut ? 'Signing out…' : '→ Sign out'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
