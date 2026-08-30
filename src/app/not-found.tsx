'use client';

import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { AgentHeader } from '@/components/public/AgentHeader';

export default function NotFound() {
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
