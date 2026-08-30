'use client';

import React, { useEffect, useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { AgentHeader } from '@/components/public/AgentHeader';
import { AgentProfileClient } from './agents/[slug]/AgentProfileClient';
import { EditAgentClient } from './admin/agents/[id]/edit/EditAgentClient';
import { AgentQRClient } from './admin/agents/[id]/qr/AgentQRClient';

export default function NotFound() {
  const [dynamicRoute, setDynamicRoute] = useState<{
    type: 'agent' | 'admin-edit' | 'admin-qr' | '404';
    param: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      
      // 1. Match /admin/agents/[id]/edit or /admin/agents/[id]/edit/
      const editMatch = path.match(/\/admin\/agents\/([^/]+)\/edit/);
      if (editMatch && editMatch[1]) {
        setDynamicRoute({ type: 'admin-edit', param: editMatch[1] });
        setIsChecking(false);
        return;
      }

      // 2. Match /admin/agents/[id]/qr or /admin/agents/[id]/qr/
      const qrMatch = path.match(/\/admin\/agents\/([^/]+)\/qr/);
      if (qrMatch && qrMatch[1]) {
        setDynamicRoute({ type: 'admin-qr', param: qrMatch[1] });
        setIsChecking(false);
        return;
      }

      // 3. Match /agents/[slug] or /agents/[slug]/
      const agentMatch = path.match(/\/agents\/([^/]+)/);
      if (agentMatch && agentMatch[1]) {
        setDynamicRoute({ type: 'agent', param: agentMatch[1] });
        setIsChecking(false);
        return;
      }
    }
    setDynamicRoute({ type: '404', param: '' });
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-vb-dark flex items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-vb-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // Dynamically render the matched client route
  if (dynamicRoute?.type === 'agent') {
    return <AgentProfileClient slug={dynamicRoute.param} />;
  }

  if (dynamicRoute?.type === 'admin-edit') {
    return (
      <div className="min-h-screen bg-vb-dark text-white p-4 sm:p-8 max-w-5xl mx-auto">
        <EditAgentClient id={dynamicRoute.param} />
      </div>
    );
  }

  if (dynamicRoute?.type === 'admin-qr') {
    return (
      <div className="min-h-screen bg-vb-dark text-white p-4 sm:p-8 max-w-5xl mx-auto">
        <AgentQRClient id={dynamicRoute.param} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vb-dark text-white flex flex-col justify-between vb-bg-glow">
      <AgentHeader />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-vb-card border border-vb-border shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-vb-gold/20 to-vb-card border border-vb-gold/40 text-vb-gold-light font-display font-extrabold text-3xl flex items-center justify-center mx-auto shadow-lg">
            404
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display text-white">Agent Profile Not Found</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The digital business card you are looking for may have moved or does not exist.
            </p>
          </div>

          <div className="pt-2 border-t border-vb-border flex flex-col gap-2.5">
            <a
              href="https://vidabricks.com"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-gold-subtle"
            >
              <Globe className="w-4 h-4" />
              <span>Visit Vidabricks Real Estate</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-vb-grey-text border-t border-vb-border">
        © {new Date().getFullYear()} Vidabricks Real Estate LLC • Dubai, UAE
      </footer>
    </div>
  );
}
