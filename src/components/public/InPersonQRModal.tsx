'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, Sparkles } from 'lucide-react';
import { Agent } from '@/lib/types';
import { generateAgentQRCodeDataUrl, downloadQRCodePng } from '@/lib/qrGenerator';
import { copyToClipboard } from '@/lib/utils';
import { platformStore } from '@/lib/store';

interface InPersonQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

export const InPersonQRModal: React.FC<InPersonQRModalProps> = ({ isOpen, onClose, agent }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/agents/${agent.slug}`
    : `https://agents.vidabricks.com/agents/${agent.slug}`;

  useEffect(() => {
    if (isOpen) {
      generateAgentQRCodeDataUrl(profileUrl, { width: 800 }).then(setQrDataUrl);
      platformStore.trackEvent(agent.id, 'qr_scan', { context: 'in_person_modal_opened' });
    }
  }, [isOpen, profileUrl, agent.id]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(profileUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    downloadQRCodePng(profileUrl, `${agent.firstName}_${agent.lastName}_QR`, 1024);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-vb-card to-vb-navy border border-vb-gold/40 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Top Gold Trim */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-vb-gold via-vb-gold-champagne to-vb-gold-light" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-vb-navy/80 hover:bg-vb-border text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Brand */}
        <div className="mb-4 mt-2 flex flex-col items-center">
          <img
            src="/logos/vidabricks-gold.png"
            alt="Vidabricks Real Estate"
            className="h-8 w-auto object-contain drop-shadow mb-2"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vb-gold/15 border border-vb-gold/30 text-vb-gold-champagne text-[10px] font-semibold tracking-wider uppercase mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Scan to Connect</span>
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            {agent.firstName} {agent.lastName}
          </h3>
          <p className="text-xs text-vb-gold-light font-medium">{agent.jobTitle}</p>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="relative p-4 bg-white rounded-2xl shadow-xl mx-auto inline-block border-2 border-vb-gold/40">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`${agent.firstName} ${agent.lastName} QR Code`}
              className="w-56 h-56 sm:w-60 sm:h-60 mx-auto object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-sm animate-pulse">
              Generating High-Res QR...
            </div>
          )}
        </div>

        {/* Scan instruction */}
        <p className="text-xs text-slate-300 mt-4 leading-relaxed">
          Point any smartphone camera to view this luxury profile and save contact details instantly.
        </p>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-white text-xs font-semibold transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-vb-gold-light" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
