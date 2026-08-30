'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { Agent } from '@/lib/types';
import { platformStore } from '@/lib/store';
import { getWhatsAppUrl } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface LeadInquiryFormProps {
  agent: Agent;
}

export const LeadInquiryForm: React.FC<LeadInquiryFormProps> = ({ agent }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('Off-Plan Investment');
  const [budget, setBudget] = useState('AED 2M – 5M');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);

    // Save lead to store
    platformStore.addLead({
      agentId: agent.id,
      agentName: `${agent.firstName} ${agent.lastName}`,
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      propertyInterest: interest,
      budgetRange: budget,
      message,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#c9a84c', '#25d366', '#ffffff'],
      });
    } catch (e) {
      // safe fallback
    }

    setLoading(false);
    setSubmitted(true);
  };

  const handleOpenWhatsAppFollowup = () => {
    const msg = `Hi ${agent.firstName}, I just submitted an inquiry on your Vidabricks card.\nName: ${name}\nPhone: ${phone}\nInterest: ${interest}\nBudget: ${budget}\n${
      message ? `Notes: ${message}` : ''
    }`;
    const url = getWhatsAppUrl(agent.whatsapp || agent.phone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (submitted) {
    return (
      <div className="w-full p-6 rounded-2xl bg-gradient-to-b from-vb-card to-vb-navy border border-emerald-500/40 text-center animate-fade-in space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white font-display">Inquiry Sent Successfully!</h4>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Thank you, <strong className="text-vb-gold-light">{name}</strong>. {agent.firstName} has received your property requirements and will get back to you shortly.
          </p>
        </div>

        <button
          onClick={handleOpenWhatsAppFollowup}
          className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-white text-transparent" />
          <span>Continue on WhatsApp Now</span>
        </button>

        <button
          onClick={() => {
            setSubmitted(false);
            setName('');
            setPhone('');
            setEmail('');
            setMessage('');
          }}
          className="text-[11px] text-slate-400 hover:text-white underline transition-colors"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-vb-card/90 border border-vb-border p-5 shadow-luxury-card">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-vb-gold-light" />
        <h3 className="text-sm font-bold tracking-wider text-vb-gold-champagne uppercase font-display">
          Inquire with {agent.firstName}
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Looking to buy, sell, or invest in Dubai? Share your criteria for tailored off-market selections.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alexander Hayes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs placeholder:text-slate-500 focus:border-vb-gold outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Phone / WhatsApp *
            </label>
            <input
              type="tel"
              required
              placeholder="+971 50 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs placeholder:text-slate-500 focus:border-vb-gold outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Property Interest
            </label>
            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none transition-colors"
            >
              <option value="Off-Plan Investment">Off-Plan Investment</option>
              <option value="Luxury Waterfront Villa">Luxury Waterfront Villa</option>
              <option value="Downtown Penthouse">Downtown Penthouse</option>
              <option value="Family Golf Community">Family Golf Community</option>
              <option value="Commercial / Office Space">Commercial / Office Space</option>
              <option value="Golden Visa Qualifying Asset">Golden Visa Qualifying Asset</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Estimated Budget (AED)
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none transition-colors"
            >
              <option value="Under AED 2M">Under AED 2M ($550K)</option>
              <option value="AED 2M – 5M">AED 2M – 5M ($550K - $1.4M)</option>
              <option value="AED 5M – 15M">AED 5M – 15M ($1.4M - $4.1M)</option>
              <option value="AED 15M – 35M">AED 15M – 35M ($4.1M - $9.5M)</option>
              <option value="AED 35M+">AED 35M+ ($9.5M+ Trophy)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
            Message or Specific Requests (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Tell us your preferred bedrooms, views, handover timeline..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs placeholder:text-slate-500 focus:border-vb-gold outline-none transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-vb-gold via-vb-gold-light to-vb-gold-champagne hover:brightness-110 text-vb-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-gold-subtle active:scale-95 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'Sending...' : 'Send Private Inquiry'}</span>
        </button>
      </form>
    </div>
  );
};
