'use client';

import React, { useState } from 'react';
import { Agent } from '@/lib/types';
import { ShieldCheck, Phone, Mail, Globe, Printer, Download, CreditCard, Sparkles, FileText, Smartphone } from 'lucide-react';
import {
  renderCardFrontCanvas,
  renderCardBackCanvas,
  renderCardSheetCanvas,
  renderFlyerCanvas,
  renderStoryCanvas,
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
  const [activeTab, setActiveTab] = useState<'business-card' | 'flyer' | 'story'>('business-card');
  const [downloading, setDownloading] = useState<string | null>(null);

  const fullName = `${agent.firstName} ${agent.lastName}`;

  // Label requested by user:
  // "Save my contact on vcard qr and view my profile on profile qr"
  const qrLabel =
    qrType === 'vcard' ? 'Save my contact on vcard qr' : 'View my profile on profile qr';
  const qrSubLabel = qrType === 'vcard' ? 'Save my contact' : 'View my profile';

  // Handlers for Business Card
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

  // Handler for Flyer / Brochure
  const handleDownloadFlyer = async () => {
    try {
      setDownloading('flyer');
      const canvas = await renderFlyerCanvas(agent, qrDataUrl, qrType);
      downloadCanvasAsPng(canvas, `${agent.slug}-vidabricks-brochure-signboard`);
    } catch (e) {
      console.error('Failed to generate flyer:', e);
    } finally {
      setDownloading(null);
    }
  };

  // Handler for Social Story
  const handleDownloadStory = async () => {
    try {
      setDownloading('story');
      const canvas = await renderStoryCanvas(agent, qrDataUrl, qrType);
      downloadCanvasAsPng(canvas, `${agent.slug}-vidabricks-whatsapp-story`);
    } catch (e) {
      console.error('Failed to generate story:', e);
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Format Selector Tabs & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center p-1 rounded-xl bg-vb-dark border border-vb-border">
          <button
            onClick={() => setActiveTab('business-card')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'business-card'
                ? 'bg-vb-gold text-vb-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Digital Business Card</span>
          </button>
          <button
            onClick={() => setActiveTab('flyer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'flyer'
                ? 'bg-vb-gold text-vb-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Property Brochure / Signboard</span>
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'story'
                ? 'bg-vb-gold text-vb-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Social / WhatsApp Story</span>
          </button>
        </div>

        {/* Tab Specific Download & Print Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'business-card' && (
            <>
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
            </>
          )}

          {activeTab === 'flyer' && (
            <button
              onClick={handleDownloadFlyer}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black text-xs font-bold transition-all shadow-gold-subtle disabled:opacity-50"
              title="Download High-Res Brochure (PNG)"
            >
              {downloading === 'flyer' ? (
                <div className="w-3.5 h-3.5 border-2 border-vb-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download Brochure (PNG)</span>
            </button>
          )}

          {activeTab === 'story' && (
            <button
              onClick={handleDownloadStory}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black text-xs font-bold transition-all shadow-gold-subtle disabled:opacity-50"
              title="Download 1080×1920 Story (PNG)"
            >
              {downloading === 'story' ? (
                <div className="w-3.5 h-3.5 border-2 border-vb-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download Story (PNG)</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-vb-dark hover:bg-vb-card border border-vb-border text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-vb-gold-light" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 1. LUXURY DIGITAL BUSINESS CARD FORMAT */}
      {activeTab === 'business-card' && (
        <div id="printable-card-area" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FRONT OF CARD */}
            <div className="relative aspect-[1.75/1] rounded-2xl p-6 bg-gradient-to-br from-[#121824] via-[#0b101c] to-[#05070d] border border-vb-gold/40 shadow-2xl flex flex-col justify-between overflow-hidden">
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

            {/* BACK OF CARD (WITH DYNAMIC QR CODE & LABELS) */}
            <div className="relative aspect-[1.75/1] rounded-2xl p-6 bg-gradient-to-br from-[#0c121e] to-[#04060b] border border-vb-gold/40 shadow-2xl flex items-center justify-between overflow-hidden">
              <div className="space-y-2.5 max-w-[55%]">
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
      )}

      {/* 2. PROPERTY BROCHURE FLYER / SIGNBOARD */}
      {activeTab === 'flyer' && (
        <div id="printable-card-area" className="p-8 rounded-3xl bg-vb-card border border-vb-gold/40 shadow-2xl max-w-2xl mx-auto space-y-6">
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
              <span className="block text-[8px] font-extrabold text-vb-black uppercase tracking-wider mt-2">
                {qrSubLabel}
              </span>
              <span className="block text-[7px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
                {qrLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SOCIAL STORY BANNER */}
      {activeTab === 'story' && (
        <div id="printable-card-area" className="w-[320px] aspect-[9/16] rounded-3xl p-6 bg-gradient-to-b from-vb-navy via-vb-card to-vb-black border border-vb-gold/50 shadow-2xl mx-auto flex flex-col justify-between text-center relative overflow-hidden">
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
              <span className="block text-[8px] font-extrabold text-vb-black uppercase tracking-wider mt-1.5">
                {qrSubLabel}
              </span>
            </div>
            <p className="text-[10px] text-vb-gold-champagne font-medium">
              {qrLabel}
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
