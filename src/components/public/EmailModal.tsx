'use client';

import React, { useState } from 'react';
import { X, Mail, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { Agent } from '@/lib/types';
import { platformStore } from '@/lib/store';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, agent }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subject = encodeURIComponent(
    `Property Inquiry via Vidabricks - Attention: ${agent.firstName} ${agent.lastName}`
  );
  const body = encodeURIComponent(
    `Dear ${agent.firstName},\n\nI am contacting you regarding luxury properties in Dubai via your Vidabricks digital profile.\n\nPlease share details of available properties.\n\nBest regards,`
  );

  const mailtoUrl = `mailto:${agent.email}?subject=${subject}&body=${body}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    agent.email
  )}&su=${subject}&body=${body}`;
  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
    agent.email
  )}&subject=${subject}&body=${body}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(agent.email);
    setCopied(true);
    platformStore.trackEvent(agent.id, 'email_click', { action: 'copy_email', email: agent.email });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-vb-card border border-vb-border p-6 shadow-2xl space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-vb-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-vb-gold/15 border border-vb-gold/30 text-vb-gold-light flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Send Email</h3>
              <p className="text-[11px] text-slate-400">Choose how you'd like to write</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-vb-navy hover:bg-vb-border text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Address Display with 1-Click Copy */}
        <div className="p-3.5 rounded-2xl bg-vb-dark border border-vb-border space-y-2">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Agent Email:</span>
            {copied && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied!
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs sm:text-sm text-vb-gold-light font-bold truncate select-all">
              {agent.email}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-vb-black'
                  : 'bg-vb-navy hover:bg-vb-border border border-vb-border text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons as Native Unblocked Anchors */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Gmail Web */}
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              platformStore.trackEvent(agent.id, 'email_click', { action: 'gmail', email: agent.email });
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black font-extrabold text-xs flex items-center justify-between transition-all shadow-gold-subtle active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-vb-black/10 flex items-center justify-center font-black text-xs">M</span>
              <span>Open in Gmail (Web & App)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* 2. Default Mail App */}
          <a
            href={mailtoUrl}
            onClick={() => {
              platformStore.trackEvent(agent.id, 'email_click', { action: 'mailto', email: agent.email });
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-vb-dark hover:bg-vb-navy border border-vb-border hover:border-vb-gold/50 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-between transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-vb-gold-light" />
              <span>Apple Mail / Default Client</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* 3. Outlook Web */}
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              platformStore.trackEvent(agent.id, 'email_click', { action: 'outlook', email: agent.email });
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-vb-dark hover:bg-vb-navy border border-vb-border hover:border-vb-gold/50 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-between transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">O</span>
              <span>Open in Outlook / Hotmail</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
          Vidabricks certified consultant response time is typically within 15 minutes.
        </p>
      </div>
    </div>
  );
};
