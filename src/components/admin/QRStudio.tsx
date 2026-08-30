'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  Printer,
  ShieldCheck,
  Smartphone,
  Eye,
} from 'lucide-react';
import { Agent } from '@/lib/types';
import {
  generateAgentQRCodeDataUrl,
  downloadQRCodePng,
  downloadQRCodeSvg,
} from '@/lib/qrGenerator';
import { copyToClipboard } from '@/lib/utils';
import { MarketingCollateral } from './MarketingCollateral';

interface QRStudioProps {
  agent: Agent;
}

export const QRStudio: React.FC<QRStudioProps> = ({ agent }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrStyle, setQrStyle] = useState<'classic' | 'gold-dark' | 'minimal'>('classic');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/agents/${agent.slug}`
    : `https://agents.vidabricks.com/agents/${agent.slug}`;

  const fullName = `${agent.firstName} ${agent.lastName}`;

  // Generate QR based on style
  useEffect(() => {
    setLoading(true);

    const styleOptions = {
      classic: {
        color: { dark: '#111111', light: '#ffffff' },
      },
      'gold-dark': {
        color: { dark: '#c9a84c', light: '#0d1322' },
      },
      minimal: {
        color: { dark: '#1e293b', light: '#f8f8f6' },
      },
    }[qrStyle];

    generateAgentQRCodeDataUrl(profileUrl, {
      width: 1024,
      ...styleOptions,
    }).then((url) => {
      setQrDataUrl(url);
      setLoading(false);
    });
  }, [profileUrl, qrStyle]);

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(profileUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadPng = (size: number = 1024) => {
    downloadQRCodePng(profileUrl, `${agent.slug}-vidabricks-qr-${size}x${size}`, size);
  };

  const handleDownloadSvg = () => {
    downloadQRCodeSvg(profileUrl, `${agent.slug}-vidabricks-qr-vector`, 800);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-vb-card via-vb-navy to-vb-card border border-vb-gold/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-vb-gold to-vb-gold-light overflow-hidden shrink-0 shadow-lg">
            <img src={agent.photo} alt={fullName} className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-white">{fullName}</h2>
              <span className="px-2 py-0.5 rounded-full bg-vb-gold/20 text-vb-gold-champagne text-[10px] font-bold border border-vb-gold/40">
                BRN: {agent.reraNumber || 'N/A'}
              </span>
            </div>
            <p className="text-xs text-vb-gold-light font-medium">{agent.jobTitle}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{profileUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopyUrl}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-white text-xs font-semibold transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-vb-gold-light" />
                <span>Copy URL</span>
              </>
            )}
          </button>

          <Link
            href={`/agents/${agent.slug}`}
            target="_blank"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black text-xs font-bold transition-all shadow-gold-subtle"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: High Res QR Frame & Download Options */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-vb-card border border-vb-border shadow-xl text-center space-y-5">
            <div className="flex items-center justify-between border-b border-vb-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-vb-gold-champagne flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-vb-gold-light" />
                High-Resolution QR Code
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                LEVEL H (30% ECC)
              </span>
            </div>

            {/* QR Code Graphic Frame */}
            <div
              className={`p-6 rounded-2xl mx-auto inline-block border-2 shadow-2xl transition-all ${
                qrStyle === 'gold-dark'
                  ? 'bg-[#0d1322] border-vb-gold/60'
                  : qrStyle === 'minimal'
                  ? 'bg-[#f8f8f6] border-slate-300'
                  : 'bg-white border-vb-gold/40'
              }`}
            >
              {loading ? (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs animate-pulse">
                  Rendering QR...
                </div>
              ) : (
                <img
                  src={qrDataUrl}
                  alt={`${fullName} QR Code`}
                  className="w-56 h-56 object-contain mx-auto"
                />
              )}
            </div>

            {/* Style Selector */}
            <div className="space-y-2 text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                QR Visual Style
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'classic', label: 'White & Dark' },
                  { key: 'gold-dark', label: 'Gold & Navy' },
                  { key: 'minimal', label: 'Off-White' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setQrStyle(s.key as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                      qrStyle === s.key
                        ? 'bg-vb-gold text-vb-black border-vb-gold shadow-sm'
                        : 'bg-vb-dark border-vb-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-2 pt-2 border-t border-vb-border">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadPng(1024)}
                  className="py-3 px-3 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>PNG (1024px)</span>
                </button>

                <button
                  onClick={() => handleDownloadPng(2048)}
                  className="py-3 px-3 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-vb-gold-light" />
                  <span>Ultra HD (2K)</span>
                </button>
              </div>

              <button
                onClick={handleDownloadSvg}
                className="w-full py-2.5 px-4 rounded-xl bg-vb-dark hover:bg-vb-navy border border-vb-border text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-vb-gold-light" />
                <span>Download Vector SVG (Print Ready)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Ready-to-Print Collateral Generator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-vb-border">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-vb-gold-light" />
                <span>Marketing & Print Collateral Studio</span>
              </h3>
              <span className="text-xs text-vb-gold-light font-medium">Auto-Formatted</span>
            </div>

            <MarketingCollateral agent={agent} qrDataUrl={qrDataUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};
