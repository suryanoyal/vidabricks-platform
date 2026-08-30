'use client';

import React from 'react';
import { Sparkles, MapPin, Building2, MessageCircle } from 'lucide-react';
import { FocusProperty, Agent } from '@/lib/types';
import { getWhatsAppUrl } from '@/lib/utils';
import { platformStore } from '@/lib/store';

interface AgentPropertiesProps {
  properties?: FocusProperty[];
  agent: Agent;
}

export const AgentProperties: React.FC<AgentPropertiesProps> = ({ properties, agent }) => {
  if (!properties || properties.length === 0) return null;

  const handlePropertyInquiry = (prop: FocusProperty) => {
    const msg = `Hi ${agent.firstName}, I am interested in learning more about ${prop.title} in ${prop.location} (${prop.startingPrice}). Please share the brochure and payment plan.`;
    platformStore.trackEvent(agent.id, 'whatsapp_click', {
      propertyInquired: prop.title,
    });
    const url = getWhatsAppUrl(agent.whatsapp || agent.phone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-vb-gold-light" />
          <h3 className="text-sm font-bold tracking-wider text-vb-gold-champagne uppercase font-display">
            Featured Developments
          </h3>
        </div>
        <span className="text-[11px] text-vb-grey-text font-medium">Curated Portfolio</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {properties.map((prop) => (
          <div
            key={prop.id}
            className="group relative rounded-2xl bg-vb-card border border-vb-border/80 overflow-hidden hover:border-vb-gold/50 transition-all duration-300 shadow-luxury-card flex flex-col sm:flex-row"
          >
            {/* Image Thumbnail */}
            <div className="relative sm:w-2/5 h-44 sm:h-auto overflow-hidden">
              <img
                src={prop.imageUrl}
                alt={prop.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-vb-card via-transparent to-transparent sm:hidden" />
              {prop.tag && (
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-vb-black/85 border border-vb-gold/40 text-vb-gold-champagne text-[10px] font-bold tracking-wide backdrop-blur-md">
                  {prop.tag}
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-4 sm:w-3/5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-vb-gold-light" />
                  <span>{prop.developer}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-vb-gold-light" />
                  <span>{prop.location}</span>
                </div>
                <h4 className="font-display font-bold text-white text-base leading-snug group-hover:text-vb-gold-light transition-colors">
                  {prop.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{prop.type}</p>
              </div>

              <div className="pt-2 border-t border-vb-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-vb-grey-text block uppercase font-medium">Starting from</span>
                  <span className="text-sm font-extrabold text-vb-gold-light font-display">
                    {prop.startingPrice}
                  </span>
                </div>

                <button
                  onClick={() => handlePropertyInquiry(prop)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/40 hover:border-transparent text-xs font-semibold transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Inquire</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
