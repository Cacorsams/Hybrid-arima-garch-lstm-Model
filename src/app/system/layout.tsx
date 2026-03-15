'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={() => setMobileOpen(!mobileOpen)} isSidebarOpen={mobileOpen} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
