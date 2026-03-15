'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      label: 'Hybrid Model',
      href: '/system/hybrid',
      icon: '/graphicons/9163005.png',
      description: 'ARIMA-GARCH-LSTM'
    },
    {
      label: 'ARIMA',
      href: '/system/arima',
      icon: '/graphicons/18498688.png',
      description: 'Linear Trends'
    },
    {
      label: 'GARCH',
      href: '/system/garch',
      icon: '/graphicons/10504075.png',
      description: 'Volatility Clusters'
    },
    {
      label: 'LSTM',
      href: '/system/lstm',
      icon: '/graphicons/12305596.png',
      description: 'Non-linear Patterns'
    }
  ];

  const NavLink = ({ item, collapsed }: { item: { label: string; href: string; icon: string | typeof LayoutDashboard; description?: string }; collapsed: boolean }) => {
    const isActive = pathname === item.href;
    const isImagePath = typeof item.icon === 'string';

    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`
          flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors
          ${isActive
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
        `}
      >
        {isImagePath ? (
          <img
            src={item.icon as string}
            alt={item.label}
            className={`w-5 h-5 object-contain shrink-0 ${isActive ? 'brightness-0 invert opacity-90' : 'opacity-70'}`}
          />
        ) : (
          <item.icon size={20} className="shrink-0 opacity-70" />
        )}
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="truncate">{item.label}</span>
            {item.description && (
              <span className="text-[11px] truncate text-zinc-500 dark:text-zinc-400 font-normal">
                {item.description}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-[50]"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-[55]
          bg-background border-r border-border
          font-sans antialiased
          transition-[width,transform] duration-200 ease-out overflow-x-hidden
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full p-4 overflow-x-hidden">
          <div className="flex items-center justify-between mb-6 px-1">
            {!isCollapsed && (
              <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                QUANT<span className="text-primary">F</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 -m-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft size={20} className={`shrink-0 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden">
            <div className="-mx-4 mb-3">
              <div className="h-px w-full bg-border" />
            </div>

            <NavLink
              item={{
                label: 'Dashboard',
                href: '/system/Dashboard',
                icon: LayoutDashboard
              }}
              collapsed={isCollapsed}
            />

            <div className="-mx-4 my-3">
              <div className="h-px w-full bg-border" />
            </div>

            {!isCollapsed && (
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 mb-2">
                Analysis
              </p>
            )}
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={isCollapsed} />
            ))}
          </nav>

          {!isCollapsed && (
            <div className="mt-auto -mx-4">
              <div className="h-px w-full bg-border" />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Pipeline active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
