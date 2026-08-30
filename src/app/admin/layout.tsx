'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { platformStore, subscribeToStore } from '@/lib/store';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { AdminUser, LeadInquiry } from '@/lib/types';
import { X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [leads, setLeads] = useState<LeadInquiry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If on login page, skip guard
    if (pathname === '/admin/login') {
      setIsLoaded(true);
      return;
    }

    const checkAuth = () => {
      const currentUser = platformStore.getAdminUser();
      if (!currentUser) {
        router.push('/admin/login');
        return;
      }
      setUser(currentUser);
      setLeads(platformStore.getLeads());
      setIsLoaded(true);
    };

    checkAuth();
    const unsubscribe = subscribeToStore(() => {
      setUser(platformStore.getAdminUser());
      setLeads(platformStore.getLeads());
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const handleLogout = () => {
    platformStore.logout();
    router.push('/admin/login');
  };

  // If on login page, render children without admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-vb-dark flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-vb-gold-light text-sm font-semibold animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-vb-gold border-t-transparent animate-spin" />
          <span>Loading Vidabricks Console...</span>
        </div>
      </div>
    );
  }

  const unreadLeads = leads.filter((l) => l.status === 'new').length;

  return (
    <div className="min-h-screen bg-vb-dark text-white flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar onLogout={handleLogout} unreadLeadsCount={unreadLeads} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/80 backdrop-blur-sm">
          <div className="relative w-64 bg-vb-navy h-full shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-vb-card text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div onClick={() => setMobileMenuOpen(false)}>
              <AdminSidebar onLogout={handleLogout} unreadLeadsCount={unreadLeads} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          user={user}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
