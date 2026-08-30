'use client';

import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Send, Mail, QrCode } from 'lucide-react';
import { Agent } from '@/lib/types';
import { copyToClipboard } from '@/lib/utils';
import { platformStore } from '@/lib/store';
import { LinkedinIcon, TwitterXIcon, TelegramIcon } from '@/components/ui/BrandIcons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
  onOpenQR?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  agent,
  onOpenQR,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/agents/${agent.slug}`
    : `https://agents.vidabricks.com/agents/${agent.slug}`;

  const shareText = `Connect with ${agent.firstName} ${agent.lastName}, ${agent.jobTitle} at Vidabricks Real Estate Dubai: ${profileUrl}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(profileUrl);
    if (success) {
      setCopied(true);
      platformStore.trackEvent(agent.id, 'profile_share', { method: 'copy_link' });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: `${agent.firstName} ${agent.lastName} | Vidabricks Real Estate Dubai`,
          text: `Contact ${agent.firstName} ${agent.lastName} (${agent.jobTitle}) at Vidabricks Real Estate Dubai.`,
          url: profileUrl,
        });
        platformStore.trackEvent(agent.id, 'profile_share', { method: 'native_share' });
        onClose();
      } catch (err) {
        // user cancelled share
      }
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      color: 'bg-[#229ED9] text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(
        `Contact ${agent.firstName} ${agent.lastName} - Vidabricks Dubai Real Estate`
      )}`,
    },
    {
      name: 'LinkedIn',
      icon: LinkedinIcon,
      color: 'bg-[#0A66C2] text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: 'X',
      icon: TwitterXIcon,
      color: 'bg-black text-white border border-neutral-700',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-700 text-white',
      url: `mailto:?subject=${encodeURIComponent(
        `${agent.firstName} ${agent.lastName} - Vidabricks Real Estate Dubai`
      )}&body=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-vb-card border border-vb-border rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-vb-border">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-white font-display">Share Profile</h3>
            <p className="text-xs text-vb-grey-text">Share {agent.firstName}’s digital business card</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-vb-navy hover:bg-vb-border text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="my-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-vb-gold-champagne mb-2">
            Profile Link
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-vb-dark border border-vb-border">
            <input
              type="text"
              readOnly
              value={profileUrl}
              className="flex-1 bg-transparent text-xs text-slate-300 px-2 outline-none select-all font-mono"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-vb-gold hover:bg-vb-gold-light text-vb-black'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
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

        {/* Social Share Grid */}
        <div className="grid grid-cols-5 gap-2.5 my-4">
          {shareLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  platformStore.trackEvent(agent.id, 'profile_share', { method: item.name });
                }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{item.name}</span>
              </a>
            );
          })}
        </div>

        {/* Extra Actions */}
        <div className="mt-5 pt-4 border-t border-vb-border flex gap-2">
          {onOpenQR && (
            <button
              onClick={() => {
                onClose();
                onOpenQR();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-white text-xs font-semibold transition-all"
            >
              <QrCode className="w-4 h-4 text-vb-gold-light" />
              <span>Show QR Code</span>
            </button>
          )}

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black text-xs font-bold transition-all"
            >
              <Send className="w-4 h-4" />
              <span>More Options</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
