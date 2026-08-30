'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  QrCode,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { platformStore } from '@/lib/store';

interface AdminSidebarProps {
  onLogout: () => void;
  unreadLeadsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout, unreadLeadsCount = 0 }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Agents Directory',
      href: '/admin/agents',
      icon: Users,
    },
    {
      label: 'Add New Agent',
      href: '/admin/agents/new',
      icon: UserPlus,
    },
    {
      label: 'QR Marketing Hub',
      href: '/admin/qr-codes',
      icon: QrCode,
    },
    {
      label: 'Leads & Inquiries',
      href: '/admin/leads',
      icon: Inbox,
      badge: unreadLeadsCount > 0 ? unreadLeadsCount : undefined,
    },
    {
      label: 'Platform Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-vb-navy border-r border-vb-border flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-vb-border">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <img
              src="/logos/vidabricks-gold.png"
              alt="Vidabricks Admin"
              className="h-9 w-auto object-contain drop-shadow-md transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm tracking-widest text-white uppercase group-hover:text-vb-gold-light transition-colors">
                VIDABRICKS
              </span>
              <span className="text-[9px] tracking-[0.2em] text-vb-gold-champagne font-semibold uppercase flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-vb-gold-light" />
                SUPER ADMIN
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-vb-grey-text px-3 py-1 block">
            Management
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-vb-gold/20 to-vb-card border border-vb-gold/50 text-vb-gold-champagne shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-vb-card/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-vb-gold-light' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-vb-border space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-vb-card transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-vb-gold-light" />
            <span>View Public Platform</span>
          </span>
        </Link>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};
