'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { useTheme } from 'next-themes';
import { Sun, Moon, Check, Users } from 'lucide-react';
import { useColorTheme } from './ColorThemeProvider';

interface HeaderProps {
  activePage?: 'home' | 'about' | 'dashboard';
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ activePage, toggleSidebar, isSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();

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
        setUser({
          name,
          email: user.email ?? '',
          role: user.user_metadata?.role
        });
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
      'ffdfbf', 'f5c842', 'fcdba1', 'f5ebcf', 'e8d5b5', 'ffd1a8', 'f2c89d', 'e3cfac'
    ];
    const idx = name.charCodeAt(0) % bgColors.length;
    const bg = bgColors[idx];
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg}`;
  }

  const avatarUrl = user ? getAvatarUrl(user.name) : '';

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-14 md:h-16">

        {/* Left side: Mobile hamburger & spacing */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-zinc-700 dark:text-zinc-200 p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {isSidebarOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Right side: user area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-3 group focus:outline-none"
                aria-label="User menu"
              >
                {/* Avatar with spinning ring */}
                <div className="relative">
                  <div className={`absolute -inset-1 rounded-full ${dropdownOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    } transition-opacity duration-300`}>
                    <div className="w-full h-full rounded-full border border-dashed border-[#1a1a1a]/20 dark:border-white/20 animate-spin [animation-duration:6s]" />
                  </div>
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* User Name - Now visible on mobile */}
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[100px] md:max-w-[150px]">
                  {user.name}
                </span>

                {/* Chevron */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={`hidden md:block text-[#888] dark:text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Email only - per user request */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">Signed in as</p>
                    <p className="text-sm font-medium text-foreground truncate mb-1">{user.email}</p>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium text-white ${user.email === 'cacorsams@gmail.com' || user.role === 'admin' ? 'bg-amber-500' : 'bg-red-500'
                      }`}>
                      {user.email === 'cacorsams@gmail.com' || user.role === 'admin' ? 'admin' : 'user'}
                    </div>
                  </div>

                  <div className="py-0.5">
                    <Link
                      href="/"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg mx-1"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                      Home
                    </Link>
                    <Link
                      href="/models"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg mx-1"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                      About
                    </Link>
                    <Link
                      href="/system/Dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg mx-1"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                      Dashboard
                    </Link>

                    {(user.email === 'cacorsams@gmail.com' || user.role === 'admin') && (
                      <Link
                        href="/system/admin/users"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg mx-1"
                      >
                        <Users size={15} className="opacity-70" />
                        User Management
                      </Link>
                    )}

                    {/* Color Theme Selector */}
                    {mounted && (
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-400 mb-2">Color Theme</p>
                        <div className="flex items-center gap-2.5">
                          {([
                            { id: 'teal', color: 'bg-teal-500' },
                            { id: 'mustard', color: 'bg-[#eab308]' }, // approx mustard-500
                            { id: 'green', color: 'bg-green-500' },
                            { id: 'magenta', color: 'bg-[#d946ef]' } // approx fuchsia/magenta-500
                          ] as const).map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setColorTheme(t.id);
                                setDropdownOpen(false);
                              }}
                              className={`relative w-5 h-5 rounded-full ${t.color} flex items-center justify-center transition-transform hover:scale-105 focus:outline-none ring-2 ${colorTheme === t.id ? 'ring-primary ring-offset-2 ring-offset-background' : 'ring-transparent'
                                }`}
                              aria-label={`Set theme to ${t.id}`}
                            >
                              {colorTheme === t.id && <Check size={10} className="text-white drop-shadow-sm" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dark/Light Mode Toggle */}
                    {mounted && (
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg mx-1"
                      >
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}>
                          <div className={`w-3 h-3 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 rounded-lg mx-1 my-1"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {loggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          )}

        </div>
      </div>
    </nav>
  );
}
