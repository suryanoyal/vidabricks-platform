'use client';

import React, { useState } from 'react';
import { Phone, Mail, UserPlus, Share2, MessageCircle, Check } from 'lucide-react';
import { Agent, BrokerageSettings } from '@/lib/types';
import { getWhatsAppUrl } from '@/lib/utils';
import { downloadVCard } from '@/lib/vcard';
import { platformStore } from '@/lib/store';
import { EmailModal } from './EmailModal';
import confetti from 'canvas-confetti';

interface ContactActionGridProps {
  agent: Agent;
  settings?: BrokerageSettings;
  onOpenShare: () => void;
}

export const ContactActionGrid: React.FC<ContactActionGridProps> = ({
  agent,
  settings,
  onOpenShare,
}) => {
  const [savedContact, setSavedContact] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const defaultMsg =
    agent.customWhatsappMessage ||
    `Hi ${agent.firstName}, I found your profile on Vidabricks and would like to know more about Dubai properties.`;

  const waUrl = getWhatsAppUrl(agent.whatsapp || agent.phone, defaultMsg);

  const handleWhatsAppClick = () => {
    platformStore.trackEvent(agent.id, 'whatsapp_click', {
      phone: agent.whatsapp,
    });
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCallClick = () => {
    platformStore.trackEvent(agent.id, 'call_click', {
      phone: agent.phone,
    });
  };

  const handleEmailClick = () => {
    setShowEmailModal(true);
  };

  const handleSaveContact = () => {
    platformStore.trackEvent(agent.id, 'contact_download');
    downloadVCard(agent, settings);
    setSavedContact(true);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#c9a84c', '#e8c97a', '#25d366', '#ffffff'],
      });
    } catch (e) {
      // safe fallback
    }

    setTimeout(() => {
      setSavedContact(false);
    }, 4000);
  };

  const handleShareClick = () => {
    onOpenShare();
  };

  return (
    <>
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        agent={agent}
      />
      <div className="w-full space-y-3">
        {/* 1. PRIMARY HERO CTA: WhatsApp */}
        <button
          onClick={handleWhatsAppClick}
          id="btn-whatsapp-primary"
          className="w-full relative overflow-hidden group py-4 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#25D366] to-[#16a34a] text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-3 shadow-whatsapp-glow transition-all transform active:scale-[0.98] hover:brightness-105"
        >
          {/* Shimmer highlight */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
          
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 fill-white text-transparent" />
          </div>
          <span className="tracking-wide">Chat on WhatsApp</span>
        </button>

        {/* 2. SECONDARY ACTION BUTTONS: Call & Email */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`tel:${agent.phone}`}
            onClick={handleCallClick}
            id="btn-call-agent"
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-white text-sm font-medium transition-all active:scale-[0.98] group"
          >
            <Phone className="w-4 h-4 text-vb-gold-light group-hover:scale-110 transition-transform" />
            <span>Call Agent</span>
          </a>

          <button
            type="button"
            onClick={handleEmailClick}
            id="btn-email-agent"
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-white text-sm font-medium transition-all active:scale-[0.98] group"
          >
            <Mail className="w-4 h-4 text-vb-gold-light group-hover:scale-110 transition-transform" />
            <span>Send Email</span>
          </button>
        </div>

      {/* 3. TERTIARY ACTIONS: Save to Contacts & Share */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleSaveContact}
          id="btn-save-vcard"
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] ${
            savedContact
              ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300'
              : 'bg-gradient-to-r from-vb-gold/20 via-vb-gold-champagne/15 to-vb-gold/10 border-vb-gold/50 hover:border-vb-gold text-vb-gold-champagne hover:text-white'
          }`}
        >
          {savedContact ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Contact Saved!</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 text-vb-gold-light" />
              <span>Add to Contacts</span>
            </>
          )}
        </button>

        <button
          onClick={handleShareClick}
          id="btn-share-profile"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-all active:scale-[0.98]"
        >
          <Share2 className="w-4 h-4 text-slate-400" />
          <span>Share Profile</span>
        </button>
      </div>
    </div>
    </>
  );
};
