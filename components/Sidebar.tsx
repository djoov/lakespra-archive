"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "Admin");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <aside className="hidden md:flex flex-col h-full w-64 bg-surface-container-lowest border-r border-border-muted z-50 shrink-0">
      <div className="flex flex-col h-full p-gutter">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <img src="/logo.png" alt="Lakespra Logo" className="w-12 h-12 object-contain" />
          <span className="font-display text-[16px] font-bold text-primary leading-tight">Lakespra<br/>Archive</span>
        </div>
        {/* Admin Profile Info */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary border border-border-muted">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-label-md text-label-md text-text-primary leading-tight truncate">{userEmail}</h3>
            <p className="text-[12px] text-text-secondary">Petugas URTU</p>
          </div>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          <Link 
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md text-label-md transition-transform active:scale-[0.98] ${
              pathname === "/dashboard" 
                ? "bg-secondary-container text-on-secondary-container" 
                : "text-text-secondary hover:bg-surface-container-high transition-colors"
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link 
            href="/pencarian"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md text-[13px] font-bold transition-transform active:scale-[0.98] ${
              pathname === "/pencarian" 
                ? "bg-secondary-container text-on-secondary-container" 
                : "text-text-secondary hover:bg-surface-container-high transition-colors"
            }`}
          >
            <span className="material-symbols-outlined">search</span>
            Pencarian Arsip
          </Link>
          <Link 
            href="/dashboard/kategori"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md text-[13px] font-bold transition-transform active:scale-[0.98] ${
              pathname === "/dashboard/kategori"
                ? "bg-secondary-container text-on-secondary-container" 
                : "text-text-secondary hover:bg-surface-container-high transition-colors"
            }`}
          >
            <span className="material-symbols-outlined">category</span>
            Manajemen Kategori
          </Link>
          <Link 
            href="/dashboard/input-dokumen"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md text-label-md transition-transform active:scale-[0.98] ${
              pathname === "/dashboard/input-dokumen"
                ? "bg-secondary-container text-on-secondary-container" 
                : "text-text-secondary hover:bg-surface-container-high transition-colors"
            }`}
          >
            <span className="material-symbols-outlined">add_box</span>
            Tambah Buku
          </Link>
          <Link 
            href="/dashboard/import-massal"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md text-label-md transition-transform active:scale-[0.98] ${
              pathname === "/dashboard/import-massal"
                ? "bg-secondary-container text-on-secondary-container" 
                : "text-text-secondary hover:bg-surface-container-high transition-colors"
            }`}
          >
            <span className="material-symbols-outlined">upload_file</span>
            Import CSV
          </Link>
        </nav>
        {/* Footer Nav */}
        <div className="pt-6 border-t border-border-muted">
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-error-container/10 transition-colors rounded-xl font-label-md text-label-md active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
