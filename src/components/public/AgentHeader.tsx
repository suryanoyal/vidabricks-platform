'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Share2, QrCode } from 'lucide-react';

interface AgentHeaderProps {
  onOpenShare?: () => void;
  onOpenQR?: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({ onOpenShare, onOpenQR }) => {
  return (
    <header className="w-full flex items-center justify-between py-4 px-4 sm:px-6 border-b border-vb-border/60 bg-vb-navy/80 backdrop-blur-md sticky top-0 z-40">
      {/* Brand Logo */}
      <a
        href="https://vidabricks.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
      >
        <img
          src="/logos/vidabricks-gold.png"
          alt="Vidabricks Real Estate Dubai"
          className="h-8 sm:h-9 w-auto object-contain drop-shadow-md transition-transform group-hover:scale-105"
        />
        <div className="hidden xs:flex flex-col">
          <span className="font-display font-extrabold text-xs sm:text-sm tracking-widest text-white uppercase group-hover:text-vb-gold-light transition-colors">
            VIDABRICKS
          </span>
          <span className="text-[8px] tracking-[0.2em] text-vb-gold-champagne font-semibold uppercase">
            REAL ESTATE • DUBAI
          </span>
        </div>
      </a>

      {/* Badges & Quick Action */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vb-card border border-vb-border text-[11px] font-medium text-vb-gold-champagne">
          <ShieldCheck className="w-3.5 h-3.5 text-vb-gold-light" />
          <span>RERA Certified</span>
        </div>

        {onOpenQR && (
          <button
            onClick={onOpenQR}
            aria-label="Show QR Code"
            className="p-2 rounded-full bg-vb-card hover:bg-vb-card-hover border border-vb-border text-white hover:text-vb-gold-light transition-all shadow-sm"
            title="Show Agent QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        )}

        {onOpenShare && (
          <button
            onClick={onOpenShare}
            aria-label="Share Profile"
            className="p-2 rounded-full bg-vb-card hover:bg-vb-card-hover border border-vb-border text-white hover:text-vb-gold-light transition-all shadow-sm"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
