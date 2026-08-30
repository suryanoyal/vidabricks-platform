'use client';

import React from 'react';
import { AgentAvatar } from '@/components/public/AgentAvatar';
import { MessageCircle, Phone, Mail, UserPlus, Share2, ShieldCheck, MapPin, Building } from 'lucide-react';
import { Agent } from '@/lib/types';

interface LiveMobileMockupProps {
  agent: Partial<Agent>;
}

export const LiveMobileMockup: React.FC<LiveMobileMockupProps> = ({ agent }) => {
  const firstName = agent.firstName || 'First';
  const lastName = agent.lastName || 'Last';
  const fullName = `${firstName} ${lastName}`;
  const jobTitle = agent.jobTitle || 'Property Consultant';
  const rera = agent.reraNumber || 'XXXXX';
  const bio = agent.bio || 'Professional real estate advisor in Dubai.';
  const specialisations = agent.specialisations || ['Off-Plan', 'Luxury Properties'];
  const languages = agent.languages || ['English'];

  return (
    <div className="sticky top-24 w-[340px] shrink-0 mx-auto">
      {/* Device Label */}
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-vb-gold-champagne flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Mobile Preview
        </span>
        <span className="text-[10px] text-slate-400">Updates in real-time</span>
      </div>

      {/* iPhone Frame */}
      <div className="relative rounded-[40px] p-3 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black border-[3px] border-neutral-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Dynamic Island / Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-end px-2">
          <div className="w-2 h-2 rounded-full bg-neutral-800" />
        </div>

        {/* Screen Container */}
        <div className="relative rounded-[32px] bg-vb-dark overflow-y-auto max-h-[580px] text-white p-4 pt-7 vb-bg-glow no-scrollbar">
          {/* Mock Nav */}
          <div className="flex items-center justify-between pb-3 border-b border-vb-border/60">
            <div className="flex items-center gap-1.5">
              <img
                src="/logos/vidabricks-gold.png"
                alt="Vidabricks"
                className="h-5 w-auto object-contain"
              />
              <span className="font-display font-bold text-[11px] tracking-wider text-white">VIDABRICKS</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-vb-gold-champagne bg-vb-card px-2 py-0.5 rounded-full border border-vb-border">
              <ShieldCheck className="w-2.5 h-2.5 text-vb-gold-light" />
              <span>RERA Certified</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="mt-4 rounded-2xl bg-vb-glass-card border border-vb-border p-4 text-center space-y-3 shadow-lg">
            <AgentAvatar
              photo={agent.photo}
              name={fullName}
              reraNumber={rera}
              size="md"
            />

            <div>
              <h4 className="font-display font-bold text-base text-white">{fullName}</h4>
              <p className="text-xs font-semibold text-vb-gold-light">{jobTitle}</p>
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mt-1">
                <Building className="w-3 h-3 text-vb-gold-light" />
                <span>Vidabricks Dubai</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 italic line-clamp-2">
              “{bio}”
            </p>

            {/* Actions Mock */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md">
                <MessageCircle className="w-3.5 h-3.5 fill-white text-transparent" />
                <span>Chat on WhatsApp</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="py-2 rounded-lg bg-vb-card border border-vb-border text-[11px] font-medium text-white flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3 text-vb-gold-light" />
                  <span>Call</span>
                </div>
                <div className="py-2 rounded-lg bg-vb-card border border-vb-border text-[11px] font-medium text-white flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3 text-vb-gold-light" />
                  <span>Email</span>
                </div>
              </div>
              <div className="py-2 rounded-lg bg-gradient-to-r from-vb-gold/20 to-vb-card border border-vb-gold/40 text-[10px] font-bold text-vb-gold-champagne flex items-center justify-center gap-1">
                <UserPlus className="w-3 h-3" />
                <span>Add to Contacts</span>
              </div>
            </div>
          </div>

          {/* Tags Mock */}
          <div className="mt-3 rounded-xl bg-vb-card border border-vb-border p-3 space-y-2 text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-vb-gold-champagne block">
              Specialisations
            </span>
            <div className="flex flex-wrap gap-1">
              {specialisations.slice(0, 3).map((spec) => (
                <span key={spec} className="px-2 py-0.5 rounded bg-vb-navy border border-vb-border text-[9px] text-slate-200">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
