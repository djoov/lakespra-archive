"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <header className="flex justify-between items-center px-gutter py-4 w-full bg-surface border-b border-border-muted/50">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 text-text-primary transition-opacity active:opacity-80"
          onClick={onMenuToggle}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Archive Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => signOut(auth)}
          className="text-text-secondary hover:text-primary transition-colors font-label-md text-label-md"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
