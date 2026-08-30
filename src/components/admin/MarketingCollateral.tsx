'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';
import { ShieldCheck, Phone, Mail, Globe, MapPin, Printer, Download } from 'lucide-react';

interface MarketingCollateralProps {
  agent: Agent;
  qrDataUrl: string;
}

export const MarketingCollateral: React.FC<MarketingCollateralProps> = ({
  agent,
  qrDataUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'business-card' | 'flyer' | 'story'>('business-card');

  const fullName = `${agent.firstName} ${agent.lastName}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Format Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center p-1 rounded-xl bg-vb-dark border border-vb-border">
          <button
            onClick={() => setActiveTab('business-card')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'business-card'
                ? 'bg-vb-gold text-vb-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Digital Business Card
          </button>
          <button
            onClick={() => setActiveTab('flyer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'flyer'
                ? 'bg-vb-gold text-vb-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Property Brochure / Signboard
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'story'
                ? 'bg-vb-gold text-vb-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Social / WhatsApp Story
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-white text-xs font-semibold transition-all shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-vb-gold-light" />
          <span>Print Collateral</span>
        </button>
      </div>

      {/* 1. LUXURY DIGITAL BUSINESS CARD FORMAT */}
      {activeTab === 'business-card' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FRONT OF CARD */}
            <div className="relative aspect-[1.75/1] rounded-2xl p-6 bg-gradient-to-br from-[#121824] via-[#0b101c] to-[#05070d] border border-vb-gold/40 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Background Luxury Gold Line */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-vb-gold/20 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-vb-gold via-vb-gold-champagne to-vb-gold-dim" />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logos/vidabricks-gold.png"
                    alt="Vidabricks"
                    className="h-8 w-auto object-contain drop-shadow"
                  />
                  <div>
                    <span className="font-display font-extrabold text-sm tracking-widest text-white block">
                      VIDABRICKS
                    </span>
                    <span className="text-[8px] tracking-[0.25em] text-vb-gold-champagne font-bold uppercase block">
                      LUXURY REAL ESTATE
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-vb-gold-champagne bg-vb-black/60 px-2 py-0.5 rounded-full border border-vb-gold/30">
                  <ShieldCheck className="w-2.5 h-2.5 text-vb-gold-light" />
                  <span>RERA ORN: 28472</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold font-display text-white tracking-tight">
                  {fullName}
                </h3>
                <p className="text-xs font-semibold text-vb-gold-light tracking-wide">
                  {agent.jobTitle}
                </p>
                <p className="text-[10px] text-slate-400">
                  RERA BRN: {agent.reraNumber || 'N/A'} • Dubai, UAE
                </p>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-vb-border/60">
                <span>Tameem House, Barsha Heights, Dubai</span>
                <span className="text-vb-gold-champagne font-mono font-bold">NFC ENABLED</span>
              </div>
            </div>

            {/* BACK OF CARD (QR CODE) */}
            <div className="relative aspect-[1.75/1] rounded-2xl p-6 bg-gradient-to-br from-[#0c121e] to-[#04060b] border border-vb-gold/40 shadow-2xl flex items-center justify-between overflow-hidden">
              <div className="space-y-2.5 max-w-[55%]">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-vb-gold-champagne block">
                  Scan to View & Save Contact
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Connect Directly with {agent.firstName}
                </h4>
                <div className="space-y-1 text-[10px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-vb-gold-light" />
                    <span>{agent.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-vb-gold-light" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-vb-gold-light" />
                    <span>vidabricks.com</span>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="p-2.5 bg-white rounded-xl shadow-lg border border-vb-gold/40 shrink-0">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-28 h-28 object-contain" />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-[10px] text-slate-400">
                    Loading QR...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROPERTY BROCHURE FLYER / SIGNBOARD */}
      {activeTab === 'flyer' && (
        <div className="p-8 rounded-3xl bg-vb-card border border-vb-gold/40 shadow-2xl max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-vb-border pb-4">
            <div className="flex items-center gap-3">
              <img
                src="/logos/vidabricks-gold.png"
                alt="Vidabricks Real Estate"
                className="h-10 w-auto object-contain drop-shadow"
              />
              <div>
                <h3 className="text-lg font-bold font-display text-white tracking-widest uppercase">
                  VIDABRICKS REAL ESTATE
                </h3>
                <span className="text-[10px] tracking-[0.2em] text-vb-gold-champagne font-bold uppercase">
                  DUBAI LUXURY BROKERAGE
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span className="block font-bold text-white">RERA ORN: 28472</span>
              <span>Barsha Heights, Dubai</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 items-center">
            <div className="col-span-2 space-y-3">
              <span className="px-3 py-1 rounded-full bg-vb-gold/20 text-vb-gold-champagne text-[11px] font-bold tracking-wider uppercase border border-vb-gold/40 inline-block">
                Official Property Consultant
              </span>
              <h2 className="text-2xl font-bold font-display text-white">{fullName}</h2>
              <p className="text-sm font-semibold text-vb-gold-light">{agent.jobTitle}</p>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                “{agent.bio}”
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {agent.specialisations.slice(0, 4).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-vb-navy border border-vb-border text-[10px] text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl text-center border-2 border-vb-gold shadow-xl">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 mx-auto object-contain" />
              ) : null}
              <span className="block text-[9px] font-extrabold text-black uppercase tracking-wider mt-2">
                Scan for VIP Portfolio
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SOCIAL STORY BANNER */}
      {activeTab === 'story' && (
        <div className="w-[320px] aspect-[9/16] rounded-3xl p-6 bg-gradient-to-b from-vb-navy via-vb-card to-vb-black border border-vb-gold/50 shadow-2xl mx-auto flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-vb-gold via-vb-gold-champagne to-vb-gold-light" />

          <div className="flex flex-col items-center gap-1.5">
            <img
              src="/logos/vidabricks-gold.png"
              alt="Vidabricks"
              className="h-10 w-auto object-contain drop-shadow"
            />
            <span className="font-display font-extrabold text-[10px] tracking-[0.25em] text-vb-gold-champagne uppercase block">
              DUBAI REAL ESTATE
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-vb-gold to-vb-gold-light mx-auto shadow-xl overflow-hidden">
              <img src={agent.photo} alt={fullName} className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">{fullName}</h3>
              <p className="text-xs font-semibold text-vb-gold-light">{agent.jobTitle}</p>
            </div>
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-vb-gold inline-block">
              {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-32 h-32 object-contain" />}
            </div>
            <p className="text-[10px] text-slate-300">
              Scan to chat on WhatsApp & explore off-plan opportunities
            </p>
          </div>

          <div className="text-[9px] text-vb-grey-text border-t border-vb-border pt-2">
            agents.vidabricks.com/agents/{agent.slug}
          </div>
        </div>
      )}
    </div>
  );
};
