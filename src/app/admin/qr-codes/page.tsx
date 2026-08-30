'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Download,
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { platformStore, subscribeToStore } from '@/lib/store';
import { Agent } from '@/lib/types';
import { generateAgentQRCodeDataUrl, downloadQRCodePng, downloadQRCodeSvg } from '@/lib/qrGenerator';

export default function QRCodesHubPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrCache, setQrCache] = useState<Record<string, string>>({});

  useEffect(() => {
    const list = platformStore.getAgents();
    setAgents(list);

    // Pre-generate QR codes for cards
    list.forEach(async (agent) => {
      const profileUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/agents/${agent.slug}`
        : `https://agents.vidabricks.com/agents/${agent.slug}`;

      const dataUrl = await generateAgentQRCodeDataUrl(profileUrl, { width: 512 });
      setQrCache((prev) => ({ ...prev, [agent.id]: dataUrl }));
    });

    const unsubscribe = subscribeToStore(() => {
      setAgents(platformStore.getAgents());
    });
    return () => unsubscribe();
  }, []);

  const filtered = agents.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(term) ||
      a.lastName.toLowerCase().includes(term) ||
      a.jobTitle.toLowerCase().includes(term) ||
      (a.reraNumber && a.reraNumber.includes(term))
    );
  });

  const handleDownloadAll = () => {
    agents.forEach((a, i) => {
      setTimeout(() => {
        const profileUrl = `${window.location.origin}/agents/${a.slug}`;
        downloadQRCodePng(profileUrl, `${a.slug}-vidabricks-qr`, 1024);
      }, i * 300);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Brokerage QR Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            High-resolution scannable QR codes for marketing brochures, signboards, and business cards
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black text-xs font-bold transition-all shadow-gold-subtle"
        >
          <Download className="w-4 h-4" />
          <span>Batch Download All QRs (PNG)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-vb-card border border-vb-border shadow-lg flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search broker by name or position to view their QR code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-white text-xs placeholder:text-slate-500 outline-none"
        />
      </div>

      {/* Grid of Agent QR Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((agent) => {
          const fullName = `${agent.firstName} ${agent.lastName}`;
          const qrUrl = qrCache[agent.id];
          const profileUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/agents/${agent.slug}`
            : `https://agents.vidabricks.com/agents/${agent.slug}`;

          return (
            <div
              key={agent.id}
              className="p-5 rounded-3xl bg-vb-card border border-vb-border hover:border-vb-gold/50 transition-all shadow-xl space-y-4 text-center group"
            >
              <div className="flex items-center justify-between border-b border-vb-border pb-3 text-left">
                <div className="flex items-center gap-2.5">
                  <img
                    src={agent.photo}
                    alt={fullName}
                    className="w-9 h-9 rounded-full object-cover border border-vb-border shrink-0"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">{fullName}</h3>
                    <span className="text-[10px] text-vb-gold-light font-medium block">
                      {agent.jobTitle}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-vb-navy text-slate-300 text-[10px] font-mono border border-vb-border">
                  BRN: {agent.reraNumber || 'N/A'}
                </span>
              </div>

              {/* QR Graphic Frame */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-vb-gold/30 shadow-md inline-block mx-auto group-hover:border-vb-gold transition-colors">
                {qrUrl ? (
                  <img src={qrUrl} alt={`${fullName} QR`} className="w-40 h-40 object-contain mx-auto" />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs animate-pulse">
                    Generating...
                  </div>
                )}
              </div>

              {/* Profile Link Display */}
              <div className="text-[10px] text-slate-400 font-mono truncate px-2">
                /agents/{agent.slug}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-vb-border">
                <button
                  onClick={() =>
                    downloadQRCodePng(profileUrl, `${agent.slug}-vidabricks-qr`, 1024)
                  }
                  className="py-2 px-3 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-vb-gold-light" />
                  <span>Download PNG</span>
                </button>

                <Link
                  href={`/admin/agents/${agent.id}/qr`}
                  className="py-2 px-3 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Studio</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
