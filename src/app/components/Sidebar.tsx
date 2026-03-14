'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  LineChart, 
  Activity, 
  BrainCircuit, 
  Users,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === 'cacorsams@gmail.com' || user?.user_metadata?.role === 'admin') {
        setIsAdmin(true);
      }
    }
    checkAdmin();
  }, [supabase.auth]);

  const navItems = [
    { 
      label: 'Hybrid Model', 
      href: '/system/dashboard', 
      icon: LayoutDashboard,
      description: 'ARIMA-GARCH-LSTM'
    },
    { 
      label: 'Standalone ARIMA', 
      href: '/system/arima', 
      icon: LineChart,
      description: 'Linear Trends'
    },
    { 
      label: 'Standalone GARCH', 
      href: '/system/garch', 
      icon: Activity,
      description: 'Volatility Clusters'
    },
    { 
      label: 'Standalone LSTM', 
      href: '/system/lstm', 
      icon: BrainCircuit,
      description: 'Non-linear Patterns'
    }
  ];

  const adminItems = [
    {
      label: 'User Management',
      href: '/system/admin/users',
      icon: Users
    }
  ];

  const NavLink = ({ item, collapsed }: { item: any, collapsed: boolean }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-primary text-primary-foreground shadow-lg shadow-black/10 dark:shadow-white/5' 
            : 'text-muted-foreground hover:bg-accent dark:hover:bg-accent/50 dark:hover:text-foreground'
        }`}
      >
        <Icon size={20} className={`shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
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
      {/* Mobile Toggle */}
      <button 
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] p-4 bg-primary text-primary-foreground rounded-full shadow-2xl active:scale-95 transition-transform"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-[55] bg-background border-r border-border dark:border-border transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="flex flex-col h-full p-4">
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
          <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
             {!isCollapsed && <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">Analysis</p>}
             {navItems.map((item) => (
               <NavLink key={item.href} item={item} collapsed={isCollapsed} />
             ))}

             {isAdmin && (
               <div className="mt-8">
                 {!isCollapsed && <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">Admin</p>}
                 {adminItems.map((item) => (
                   <NavLink key={item.href} item={item} collapsed={isCollapsed} />
                 ))}
               </div>
             )}
          </div>

          {/* Footer Card */}
          {!isCollapsed && (
            <div className="mt-auto p-4 bg-card rounded-2xl border border-border shadow-sm">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-foreground">Pipeline Active</span>
                </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
