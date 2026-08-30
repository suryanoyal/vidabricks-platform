'use client';

import React, { useEffect, useState } from 'react';
import {
  Inbox,
  MessageCircle,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Building,
} from 'lucide-react';
import { platformStore, subscribeToStore } from '@/lib/store';
import { LeadInquiry } from '@/lib/types';
import { getWhatsAppUrl } from '@/lib/utils';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadInquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');

  useEffect(() => {
    setLeads(platformStore.getLeads());
    const unsubscribe = subscribeToStore(() => {
      setLeads(platformStore.getLeads());
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = (leadId: string, newStatus: 'new' | 'contacted' | 'closed') => {
    platformStore.updateLeadStatus(leadId, newStatus);
  };

  const filtered = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      lead.clientName.toLowerCase().includes(term) ||
      lead.clientPhone.includes(term) ||
      (lead.clientEmail && lead.clientEmail.toLowerCase().includes(term)) ||
      lead.agentName.toLowerCase().includes(term) ||
      (lead.propertyInterest && lead.propertyInterest.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'all' ? true : lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Leads & Client Inquiries
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Private investor inquiries submitted directly through Vidabricks agent digital business cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
            {leads.filter((l) => l.status === 'new').length} New Uncontacted Leads
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-vb-card border border-vb-border shadow-lg flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads by client name, broker, phone, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs placeholder:text-slate-500 outline-none focus:border-vb-gold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
        >
          <option value="all">All Lead Statuses</option>
          <option value="new">New Inquiries</option>
          <option value="contacted">Contacted / In Progress</option>
          <option value="closed">Closed / Converted</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="rounded-3xl bg-vb-card border border-vb-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vb-border bg-vb-navy/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 sm:px-6">Client Name</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Assigned Broker</th>
                <th className="py-4 px-4">Interest & Budget</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 sm:px-6 text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vb-border text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No inquiries match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  const waUrl = getWhatsAppUrl(
                    lead.clientPhone,
                    `Hello ${lead.clientName}, this is regarding your property inquiry at Vidabricks Real Estate Dubai.`
                  );

                  return (
                    <tr key={lead.id} className="hover:bg-vb-navy/40 transition-colors">
                      {/* Client Name & Time */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-sm block">
                            {lead.clientName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(lead.createdAt).toLocaleDateString()} at{' '}
                            {new Date(lead.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-vb-gold-light" />
                            <span>{lead.clientPhone}</span>
                          </div>
                          {lead.clientEmail && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Mail className="w-3 h-3 text-vb-gold-light" />
                              <span className="truncate max-w-[150px]">{lead.clientEmail}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Assigned Broker */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-vb-navy border border-vb-border text-vb-gold-champagne text-xs font-semibold inline-block">
                          {lead.agentName}
                        </span>
                      </td>

                      {/* Interest & Budget */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white block">
                            {lead.propertyInterest || 'General Inquiry'}
                          </span>
                          <span className="text-[11px] text-vb-gold-light block font-mono">
                            {lead.budgetRange}
                          </span>
                          {lead.message && (
                            <p className="text-[10px] text-slate-400 italic line-clamp-1">
                              “{lead.message}”
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase outline-none border transition-colors ${
                            lead.status === 'new'
                              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                              : lead.status === 'contacted'
                              ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                              : 'bg-neutral-800 border-neutral-600 text-slate-300'
                          }`}
                        >
                          <option value="new">NEW</option>
                          <option value="contacted">CONTACTED</option>
                          <option value="closed">CLOSED</option>
                        </select>
                      </td>

                      {/* Instant Action Button */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white text-[11px] font-bold transition-all shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white text-transparent" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${lead.clientPhone}`}
                            className="p-1.5 rounded-lg bg-vb-navy hover:bg-vb-border text-slate-300 hover:text-white"
                            title="Call Client"
                          >
                            <Phone className="w-3.5 h-3.5 text-vb-gold-light" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
