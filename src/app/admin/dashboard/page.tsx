'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  QrCode,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  UserPlus,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { platformStore, subscribeToStore } from '@/lib/store';
import { Agent, AnalyticsEvent, LeadInquiry } from '@/lib/types';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';

export default function AdminDashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [leads, setLeads] = useState<LeadInquiry[]>([]);

  useEffect(() => {
    setAgents(platformStore.getAgents());
    setEvents(platformStore.getAnalyticsEvents());
    setLeads(platformStore.getLeads());

    const unsubscribe = subscribeToStore(() => {
      setAgents(platformStore.getAgents());
      setEvents(platformStore.getAnalyticsEvents());
      setLeads(platformStore.getLeads());
    });

    return () => unsubscribe();
  }, []);

  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const inactiveAgents = agents.filter((a) => a.status === 'inactive').length;
  const totalViews = agents.reduce((acc, a) => acc + (a.profileViews || 0), 0);
  const totalWhatsapp = agents.reduce((acc, a) => acc + (a.whatsappClicks || 0), 0);
  const totalCalls = agents.reduce((acc, a) => acc + (a.callClicks || 0), 0);
  const totalEmails = agents.reduce((acc, a) => acc + (a.emailClicks || 0), 0);
  const totalVcards = agents.reduce((acc, a) => acc + (a.vcardDownloads || 0), 0);

  // Conversion rate: (% of views that took a contact action)
  const totalInteractions = totalWhatsapp + totalCalls + totalEmails + totalVcards;
  const conversionRate = totalViews > 0 ? ((totalInteractions / totalViews) * 100).toFixed(1) : '0.0';

  // Leaderboard: sort by views & whatsapp clicks
  const topAgents = [...agents]
    .sort((a, b) => (b.profileViews + b.whatsappClicks * 2) - (a.profileViews + a.whatsappClicks * 2))
    .slice(0, 5);

  const recentEvents = events.slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Executive Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-vb-gold/20 text-vb-gold-champagne text-xs font-bold border border-vb-gold/30">
              Dubai Headquarters
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time digital identity performance and lead conversion across Vidabricks brokers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/qr-codes"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-white text-xs font-semibold transition-all"
          >
            <QrCode className="w-4 h-4 text-vb-gold-light" />
            <span>QR Hub</span>
          </Link>
          <Link
            href="/admin/agents/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black text-xs font-bold transition-all shadow-gold-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Agent</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total & Active Agents */}
        <div className="p-5 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Brokers</span>
            <div className="w-8 h-8 rounded-lg bg-vb-navy flex items-center justify-center text-vb-gold-light">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {totalAgents}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">{activeAgents} Active</span>
          </div>
          <p className="text-[10px] text-slate-500">{inactiveAgents} inactive or draft profiles</p>
        </div>

        {/* Profile Views */}
        <div className="p-5 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Card Views</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-xs text-sky-400 font-semibold">+18.4%</span>
          </div>
          <p className="text-[10px] text-slate-500">From WhatsApp shares & QR scans</p>
        </div>

        {/* WhatsApp Direct Inquiries */}
        <div className="p-5 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">WhatsApp Clicks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              {totalWhatsapp.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">{conversionRate}% Conv.</span>
          </div>
          <p className="text-[10px] text-slate-500">Direct client chats initiated</p>
        </div>

        {/* Total Calls & Emails */}
        <div className="p-5 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Calls & Emails</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {(totalCalls + totalEmails).toLocaleString()}
            </span>
            <span className="text-xs text-amber-400 font-semibold">{totalCalls} Calls</span>
          </div>
          <p className="text-[10px] text-slate-500">{totalEmails} email inquiries dispatched</p>
        </div>
      </div>

      {/* INTERACTIVE ENGAGEMENT CHARTS */}
      <AnalyticsCharts events={events} />

      {/* BOTTOM SPLIT: TOP AGENT LEADERBOARD & RECENT EVENT STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Top Performing Agents Leaderboard */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-vb-border pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-vb-gold-light" />
                <span>Top Performing Agents</span>
              </h3>
              <p className="text-xs text-slate-400">Ranked by client profile views and WhatsApp conversations</p>
            </div>
            <Link href="/admin/agents" className="text-xs text-vb-gold-light hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {topAgents.map((agent, index) => (
              <div
                key={agent.id}
                className="p-3.5 rounded-2xl bg-vb-dark/70 border border-vb-border hover:border-vb-gold/40 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-vb-gold text-vb-black'
                        : index === 1
                        ? 'bg-slate-300 text-vb-black'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-vb-navy text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <img
                    src={agent.photo}
                    alt={agent.firstName}
                    className="w-10 h-10 rounded-full object-cover border border-vb-border"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {agent.firstName} {agent.lastName}
                    </h4>
                    <span className="text-[11px] text-vb-gold-light font-medium block">
                      {agent.jobTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {agent.profileViews.toLocaleString()} views
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">
                      {agent.whatsappClicks} WhatsApp
                    </span>
                  </div>

                  <Link
                    href={`/admin/agents/${agent.id}/qr`}
                    className="p-2 rounded-lg bg-vb-navy hover:bg-vb-border text-slate-300 hover:text-white transition-colors"
                    title="Open QR Studio"
                  >
                    <QrCode className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Activity Stream */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-vb-border pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-display">Live Activity Stream</h3>
              <p className="text-xs text-slate-400">Recent real-time interactions across profiles</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="space-y-3">
            {recentEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-vb-dark/60 border border-vb-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      evt.eventType === 'whatsapp_click'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : evt.eventType === 'call_click'
                        ? 'bg-amber-500/20 text-amber-400'
                        : evt.eventType === 'inquiry_submit'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}
                  >
                    {evt.eventType === 'whatsapp_click' ? (
                      <MessageCircle className="w-3.5 h-3.5" />
                    ) : evt.eventType === 'call_click' ? (
                      <Phone className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-white block capitalize">
                      {evt.eventType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{evt.agentName}</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
