'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  Activity,
  BrainCircuit,
  ChevronLeft,
  X
} from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const supabase = createClient();


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

  const NavLink = ({ item, collapsed, noGlow }: { item: any, collapsed: boolean, noGlow?: boolean }) => {
    const isActive = pathname === item.href;
    const isImagePath = typeof item.icon === 'string';

    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
            ? `bg-primary text-primary-foreground ${noGlow ? '' : 'shadow-lg shadow-black/10 dark:shadow-white/5'}`
            : 'text-muted-foreground hover:bg-accent dark:hover:bg-accent/50 dark:hover:text-foreground'
          }`}
      >
        {isImagePath ? (
          <img
            src={item.icon}
            alt={item.label}
            className={`w-5 h-5 object-contain shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'
              } ${isActive ? 'brightness-0 invert' : ''}`}
          />
        ) : (
          <item.icon size={20} className={`shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
        )}
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate">{item.label}</span>
            {item.description && (
              <span className={`text-[10px] truncate ${isActive ? 'text-white/60 dark:text-[#1a1a1a]/60' : 'text-gray-400'}`}>
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
      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-[55] bg-background border-r border-border dark:border-border transition-all duration-300 ease-in-out overflow-x-hidden ${isCollapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        <div className="flex flex-col h-full p-4 overflow-x-hidden">
          {/* Logo / Brand */}
          <div className="flex items-center justify-between mb-8 px-2">
            {!isCollapsed && (
              <span className="text-xl font-black tracking-tighter text-[#1a1a1a] dark:text-white font-serif">
                QUANT<span className="text-[#d94040]">F</span>
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-accent dark:hover:bg-accent/50 text-muted-foreground transition-colors"
            >
              <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
            <div className="-mx-4">
              <div className="h-[1px] w-full bg-border mb-4" />
            </div>
            
            <NavLink
              item={{
                label: 'Dashboard',
                href: '/system/Dashboard',
                icon: LayoutDashboard
              }}
              collapsed={isCollapsed}
              noGlow={true}
            />

            <div className="-mx-4">
              <div className="h-[1px] w-full bg-border my-4" />
            </div>

            {!isCollapsed && <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-widest px-3 mb-3">Analysis</p>}
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={isCollapsed} />
            ))}

          </div>

          {/* Footer Status */}
          {!isCollapsed && (
            <div className="mt-auto -mx-4">
              <div className="h-[1px] w-full bg-border mb-4" />
              <div className="px-6 flex items-center justify-between pb-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-tight">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-foreground">Pipeline active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
