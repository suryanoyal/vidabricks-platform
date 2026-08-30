'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Globe,
  Award,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
  PhoneCall,
  Clock,
  Briefcase,
} from 'lucide-react';
import { Agent, BrokerageSettings } from '@/lib/types';
import { platformStore } from '@/lib/store';
import { AgentHeader } from '@/components/public/AgentHeader';
import { AgentAvatar } from '@/components/public/AgentAvatar';
import { ContactActionGrid } from '@/components/public/ContactActionGrid';
import { StickyMobileBar } from '@/components/public/StickyMobileBar';
import { ShareModal } from '@/components/public/ShareModal';
import { InPersonQRModal } from '@/components/public/InPersonQRModal';
import { AgentProperties } from '@/components/public/AgentProperties';
import { LeadInquiryForm } from '@/components/public/LeadInquiryForm';
import { SocialLinksGrid } from '@/components/public/SocialLinksGrid';

interface AgentProfileClientProps {
  initialAgent?: Agent;
  slug: string;
}

export const AgentProfileClient: React.FC<AgentProfileClientProps> = ({
  initialAgent,
  slug,
}) => {
  const [agent, setAgent] = useState<Agent | undefined>(initialAgent);
  const [settings, setSettings] = useState<BrokerageSettings>();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    // Load fresh data from store
    const found = platformStore.getAgentBySlug(slug);
    if (found) {
      setAgent(found);
      // Track profile view
      platformStore.trackEvent(found.id, 'profile_view');
    }
    setSettings(platformStore.getSettings());
  }, [slug]);

  // Inactive Profile Branded State
  if (agent && agent.status === 'inactive') {
    return (
      <div className="min-h-screen bg-vb-dark flex flex-col justify-between text-white vb-bg-glow">
        <AgentHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-vb-card border border-vb-border text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-white">Profile Unavailable</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                This Vidabricks agent profile is currently inactive or undergoing maintenance.
              </p>
            </div>
            <div className="pt-4 border-t border-vb-border">
              <a
                href="https://vidabricks.com"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light text-vb-black font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-gold-subtle"
              >
                <span>Visit Vidabricks Real Estate</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <footer className="py-6 text-center text-xs text-vb-grey-text border-t border-vb-border">
          © {new Date().getFullYear()} Vidabricks Real Estate LLC • Dubai, UAE
        </footer>
      </div>
    );
  }

  // Not Found State
  if (!agent) {
    return (
      <div className="min-h-screen bg-vb-dark flex flex-col justify-between text-white vb-bg-glow">
        <AgentHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-vb-card border border-vb-border text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto font-display text-2xl font-bold">
              404
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-white">Agent Not Found</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                The agent profile for <code className="text-vb-gold-light font-mono text-xs">/agents/{slug}</code> could not be found.
              </p>
            </div>
            <div className="pt-4 border-t border-vb-border">
              <a
                href="https://vidabricks.com"
                className="w-full py-3.5 px-6 rounded-xl bg-vb-gold hover:bg-vb-gold-light text-vb-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Visit Vidabricks Real Estate</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vb-dark text-white flex flex-col vb-bg-glow pb-24 sm:pb-12">
      {/* Top Sticky Header */}
      <AgentHeader
        onOpenShare={() => setShowShareModal(true)}
        onOpenQR={() => setShowQRModal(true)}
      />

      {/* Main Profile Body Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        {/* TOP HERO PROFILE CARD */}
        <div className="relative rounded-3xl bg-vb-glass-card border border-vb-border/90 p-6 sm:p-7 shadow-luxury-card text-center overflow-hidden">
          {/* Subtle Top Gold Highlight Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-vb-gold to-transparent opacity-80" />

          {/* Avatar Section */}
          <div className="mb-4">
            <AgentAvatar
              photo={agent.photo}
              name={`${agent.firstName} ${agent.lastName}`}
              reraNumber={agent.reraNumber}
              size="xl"
            />
          </div>

          {/* Name & Job Title */}
          <div className="space-y-1.5 mt-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              {agent.firstName} {agent.lastName}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-vb-gold-light tracking-wide">
              {agent.jobTitle}
            </p>

            {/* Brokerage & Location Tag */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1 font-medium">
                <Building className="w-3.5 h-3.5 text-vb-gold-light" />
                Vidabricks Real Estate
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-vb-gold-light" />
                Dubai, UAE
              </span>
            </div>
          </div>

          {/* Experience & Nationality Badges (if available) */}
          {(agent.experienceYears || agent.nationality) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-vb-border/50">
              {agent.experienceYears && (
                <span className="px-2.5 py-0.5 rounded-full bg-vb-navy border border-vb-border text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-vb-gold-light" />
                  {agent.experienceYears}+ Years Experience
                </span>
              )}
              {agent.nationality && (
                <span className="px-2.5 py-0.5 rounded-full bg-vb-navy border border-vb-border text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-vb-gold-light" />
                  {agent.nationality}
                </span>
              )}
            </div>
          )}

          {/* Bio Quote */}
          {agent.bio && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mt-4 px-2 font-serif text-slate-300">
              “{agent.bio}”
            </p>
          )}

          {/* Contact Action Grid */}
          <div className="mt-6 pt-5 border-t border-vb-border/70">
            <ContactActionGrid
              agent={agent}
              settings={settings}
              onOpenShare={() => setShowShareModal(true)}
            />
          </div>
        </div>

        {/* PROFESSIONAL CREDENTIALS & SPECIALISATIONS */}
        <div className="rounded-3xl bg-vb-glass-card border border-vb-border/90 p-6 shadow-luxury-card space-y-5">
          {/* Specialisations Tags */}
          {agent.specialisations && agent.specialisations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-vb-gold-champagne mb-2.5">
                <Award className="w-3.5 h-3.5 text-vb-gold-light" />
                <span>Specialisations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.specialisations.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-lg bg-vb-navy border border-vb-gold/30 text-vb-gold-champagne text-xs font-medium tracking-wide shadow-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prime Areas */}
          {agent.areas && agent.areas.length > 0 && (
            <div className="pt-4 border-t border-vb-border/60">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-vb-gold-champagne mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-vb-gold-light" />
                <span>Prime Areas of Expertise</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.areas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1 rounded-lg bg-vb-dark/80 border border-vb-border text-slate-200 text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages Spoken */}
          {agent.languages && agent.languages.length > 0 && (
            <div className="pt-4 border-t border-vb-border/60">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-vb-gold-champagne mb-2.5">
                <Globe className="w-3.5 h-3.5 text-vb-gold-light" />
                <span>Languages Spoken</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2.5 py-1 rounded-md bg-vb-navy border border-vb-border text-slate-300 text-xs font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <SocialLinksGrid social={agent.social} agent={agent} />
        </div>

        {/* FEATURED PROPERTIES CURATED BY AGENT */}
        {agent.focusProperties && agent.focusProperties.length > 0 && (
          <AgentProperties properties={agent.focusProperties} agent={agent} />
        )}

        {/* DIRECT LEAD INQUIRY FORM */}
        <LeadInquiryForm agent={agent} />

        {/* BROKERAGE TRUST FOOTER */}
        <div className="rounded-2xl bg-vb-card/60 border border-vb-border p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-vb-gold-light" />
            <span className="text-xs font-semibold text-white tracking-wide">
              Official Vidabricks Real Estate Profile
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Registered Real Estate Brokerage in Dubai, UAE • RERA ORN: 28472
            <br />
            Tameem House, Barsha Heights, Dubai, United Arab Emirates
          </p>
          <div className="pt-2 border-t border-vb-border flex items-center justify-center gap-4 text-[11px] text-vb-gold-light">
            <a href="tel:+971547005470" className="hover:underline flex items-center gap-1">
              <PhoneCall className="w-3 h-3" />
              +971 54 700 5470
            </a>
            <span>•</span>
            <a href="https://vidabricks.com" target="_blank" rel="noreferrer" className="hover:underline">
              vidabricks.com
            </a>
          </div>
        </div>
      </main>

      {/* FIXED STICKY ACTION BAR ON MOBILE */}
      <StickyMobileBar agent={agent} settings={settings} />

      {/* SHARE MODAL */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        agent={agent}
        onOpenQR={() => {
          setShowShareModal(false);
          setShowQRModal(true);
        }}
      />

      {/* IN-PERSON QR CODE SCAN MODAL */}
      <InPersonQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        agent={agent}
      />
    </div>
  );
};
