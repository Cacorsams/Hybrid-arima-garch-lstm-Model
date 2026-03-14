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
      'ffdfbf', 'f5c842', 'fcdba1', 'f5ebcf', 'e8d5b5', 'ffd1a8', 'f2c89d', 'e3cfac'
    ];
    const idx = name.charCodeAt(0) % bgColors.length;
    const bg = bgColors[idx];
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg}`;
  }

  const avatarUrl = user ? getAvatarUrl(user.name) : '';

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
        
        {/* Navigation spacer for minimalism */}
        <div />

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
                  <div className={`absolute -inset-1 rounded-full ${
                    dropdownOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity duration-300`}>
                    <div className="w-full h-full rounded-full border border-dashed border-[#1a1a1a]/20 dark:border-white/20 animate-spin [animation-duration:6s]" />
                  </div>
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* User Name */}
                <span className="hidden md:block text-sm font-semibold text-[#1a1a1a] dark:text-white truncate max-w-[150px]">
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
                <div className="absolute right-0 mt-3 w-64 bg-card rounded-2xl border border-border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Email only - per user request */}
                  <div className="px-5 py-4 border-b border-border">
                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-[#555] dark:text-gray-300 hover:bg-[#f9f7f5] dark:hover:bg-gray-800 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      Home
                    </Link>
                    <Link
                      href="/models"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-[#555] dark:text-gray-300 hover:bg-[#f9f7f5] dark:hover:bg-gray-800 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      About
                    </Link>
                    <Link
                      href="/system/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground hover:bg-accent dark:hover:bg-accent/50 hover:text-foreground transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      Dashboard
                    </Link>

                    {/* Theme Toggle */}
                    {mounted && (
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center justify-between px-5 py-3 text-sm text-muted-foreground hover:bg-accent dark:hover:bg-accent/50 hover:text-foreground transition-colors"
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
                  <div className="border-t border-border pt-1">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      {loggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#e0dbd5] dark:bg-gray-800 animate-pulse" />
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-[#1a1a1a] dark:text-white p-2 ml-2"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
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
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          {user && (
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-[#1a1a1a] dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-[#888] dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <Link href="/" className="block py-3 text-base text-[#555] dark:text-gray-400">Home</Link>
            <Link href="/models" className="block py-3 text-base text-[#555] dark:text-gray-400">About</Link>
            <Link href="/system/dashboard" className="block py-3 text-base text-[#555] dark:text-gray-400">Dashboard</Link>
            
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center justify-between py-4 text-base text-[#555] dark:text-gray-400"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
              className="w-full text-left py-4 text-base text-red-500 font-bold"
            >
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
