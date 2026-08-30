'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Bell, Shield, ExternalLink, Plus } from 'lucide-react';
import { AdminUser } from '@/lib/types';

interface AdminNavbarProps {
  user: AdminUser | null;
  onOpenMobileMenu?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ user, onOpenMobileMenu }) => {
  return (
    <header className="h-16 bg-vb-navy/90 backdrop-blur-md border-b border-vb-border px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg bg-vb-card text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-medium">Dubai Brokerage Console</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/agents/new"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vb-gold hover:bg-vb-gold-light text-vb-black text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Agent</span>
        </Link>

        {/* User Info Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-vb-card border border-vb-border">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-vb-gold to-vb-gold-light text-vb-black flex items-center justify-center font-bold text-[10px]">
            SA
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-white leading-tight">
              {user?.name || 'Super Admin'}
            </span>
            <span className="text-[9px] text-vb-gold-champagne font-medium uppercase tracking-wider">
              Vidabricks Dubai
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
