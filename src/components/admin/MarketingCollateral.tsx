'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';
import { ShieldCheck, Phone, Mail, Globe, Printer, Download, CreditCard, Sparkles, Check } from 'lucide-react';
import {
  renderCardFrontCanvas,
  renderCardBackCanvas,
  renderCardSheetCanvas,
  downloadCanvasAsPng,
} from '@/lib/cardCanvas';

interface MarketingCollateralProps {
  agent: Agent;
  qrDataUrl: string;
  qrType?: 'vcard' | 'profile';
}

export const MarketingCollateral: React.FC<MarketingCollateralProps> = ({
  agent,
  qrDataUrl,
  qrType = 'vcard',
}) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const fullName = `${agent.firstName} ${agent.lastName}`;

  // Label requested by user:
  // "Save my contact on vcard qr and view my profile on profile qr"
  const qrLabel =
    qrType === 'vcard' ? 'Save my contact on vcard qr' : 'View my profile on profile qr';
  const qrSubLabel = qrType === 'vcard' ? 'Save my contact' : 'View my profile';

  const handleDownloadSheet = async () => {
    try {
      setDownloading('sheet');
      const canvas = await renderCardSheetCanvas(agent, qrDataUrl, qrType);
      downloadCanvasAsPng(canvas, `${agent.slug}-vidabricks-card-front-and-back`);
    } catch (e) {
      console.error('Failed to generate card sheet:', e);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadFront = async () => {
    try {
      setDownloading('front');
      const canvas = await renderCardFrontCanvas(agent);
      downloadCanvasAsPng(canvas, `${agent.slug}-vidabricks-card-front`);
    } catch (e) {
      console.error('Failed to generate front card:', e);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadBack = async () => {
    try {
      setDownloading('back');
      const canvas = await renderCardBackCanvas(agent, qrDataUrl, qrType);
      downloadCanvasAsPng(canvas, `${agent.slug}-vidabricks-card-back-${qrType}`);
    } catch (e) {
      console.error('Failed to generate back card:', e);
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Bar with Download & Print Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-vb-gold/15 border border-vb-gold/30 text-vb-gold-light">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display">
              Luxury Digital Business Card
            </h4>
            <p className="text-[11px] text-slate-400">
              Standard 3.5″ × 2″ luxury print & digital format (Front & Back)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadSheet}
            disabled={downloading !== null}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black text-xs font-bold transition-all shadow-gold-subtle disabled:opacity-50"
            title="Download Front & Back Cards (PNG)"
          >
            {downloading === 'sheet' ? (
              <div className="w-3.5 h-3.5 border-2 border-vb-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download Card (Front & Back)</span>
          </button>

          <button
            onClick={handleDownloadFront}
            disabled={downloading !== null}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
            title="Download Front Card Only"
          >
            <Download className="w-3 h-3 text-vb-gold-light" />
            <span>Front</span>
          </button>

          <button
            onClick={handleDownloadBack}
            disabled={downloading !== null}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
            title="Download Back Card Only"
          >
            <Download className="w-3 h-3 text-vb-gold-light" />
            <span>Back</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-vb-dark hover:bg-vb-card border border-vb-border text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-vb-gold-light" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* LUXURY DIGITAL BUSINESS CARD DISPLAY (PRINTABLE AREA) */}
      <div id="printable-card-area" className="space-y-6">
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

          {/* BACK OF CARD (WITH DYNAMIC QR CODE & LABEL) */}
          <div className="relative aspect-[1.75/1] rounded-2xl p-6 bg-gradient-to-br from-[#0c121e] to-[#04060b] border border-vb-gold/40 shadow-2xl flex items-center justify-between overflow-hidden">
            <div className="space-y-2.5 max-w-[55%]">
              {/* Dynamic Label requested by user */}
              <span className="inline-block px-2 py-0.5 rounded-md bg-vb-gold/20 border border-vb-gold/40 text-[9px] font-bold tracking-wider text-vb-gold-champagne uppercase">
                {qrLabel}
              </span>
              <h4 className="text-sm font-bold text-white leading-tight">
                Connect Directly with {agent.firstName}
              </h4>
              <div className="space-y-1 text-[10px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-vb-gold-light shrink-0" />
                  <span className="truncate">{agent.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-vb-gold-light shrink-0" />
                  <span className="truncate">{agent.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-vb-gold-light shrink-0" />
                  <span>vidabricks.com</span>
                </div>
              </div>
            </div>

            {/* QR Code Container with Sub-label */}
            <div className="flex flex-col items-center shrink-0">
              <div className="p-2.5 bg-white rounded-xl shadow-lg border border-vb-gold/40">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-24 h-24 object-contain" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-[10px] text-slate-400">
                    Loading QR...
                  </div>
                )}
                <span className="block text-[8px] font-extrabold text-vb-black text-center uppercase tracking-wider mt-1">
                  {qrSubLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
