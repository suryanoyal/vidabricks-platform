'use client';

import React from 'react';
import { MessageCircle, Phone, UserPlus } from 'lucide-react';
import { Agent, BrokerageSettings } from '@/lib/types';
import { getWhatsAppUrl } from '@/lib/utils';
import { downloadVCard } from '@/lib/vcard';
import { platformStore } from '@/lib/store';

interface StickyMobileBarProps {
  agent: Agent;
  settings?: BrokerageSettings;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({ agent, settings }) => {
  const defaultMsg =
    agent.customWhatsappMessage ||
    `Hi ${agent.firstName}, I found your profile on Vidabricks and would like to know more about Dubai properties.`;

  const waUrl = getWhatsAppUrl(agent.whatsapp || agent.phone, defaultMsg);

  const handleWhatsApp = () => {
    platformStore.trackEvent(agent.id, 'whatsapp_click');
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    platformStore.trackEvent(agent.id, 'call_click');
    window.location.href = `tel:${agent.phone}`;
  };

  const handleSaveContact = () => {
    platformStore.trackEvent(agent.id, 'contact_download');
    downloadVCard(agent, settings);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2.5 bg-vb-black/90 backdrop-blur-xl border-t border-vb-gold/30 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] sm:hidden">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#25D366] text-white active:scale-95 transition-transform"
        >
          <MessageCircle className="w-5 h-5 fill-white text-transparent" />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">WhatsApp</span>
        </button>

        {/* Call */}
        <button
          onClick={handleCall}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-vb-card border border-vb-border text-white active:scale-95 transition-transform"
        >
          <Phone className="w-5 h-5 text-vb-gold-light" />
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Call</span>
        </button>

        {/* Save Contact */}
        <button
          onClick={handleSaveContact}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-br from-vb-gold/30 to-vb-card border border-vb-gold/50 text-vb-gold-champagne active:scale-95 transition-transform"
        >
          <UserPlus className="w-5 h-5 text-vb-gold-light" />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Save VCF</span>
        </button>
      </div>
    </div>
  );
};
