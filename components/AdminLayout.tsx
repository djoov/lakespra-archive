"use client";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { AuthGuard } from "@/components/AuthGuard";
import { useState } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-surface text-text-primary antialiased selection:bg-secondary-container">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* SideNavBar — Desktop: always visible, Mobile: slide in */}
        <div className={`fixed md:relative z-50 h-full transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* TopAppBar */}
          <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-gutter space-y-gutter relative">
              {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
