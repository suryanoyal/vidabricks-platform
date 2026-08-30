'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Plus,
  QrCode,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Power,
  ArrowUpDown,
  ShieldCheck,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { platformStore, subscribeToStore } from '@/lib/store';
import { Agent } from '@/lib/types';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [specialisationFilter, setSpecialisationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'views' | 'whatsapp'>('views');

  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Agent | null>(null);

  useEffect(() => {
    setAgents(platformStore.getAgents());
    const unsubscribe = subscribeToStore(() => {
      setAgents(platformStore.getAgents());
    });
    return () => unsubscribe();
  }, []);

  // Collect all unique specialisations for filter dropdown
  const allSpecialisations = Array.from(
    new Set(agents.flatMap((a) => a.specialisations || []))
  );

  // Filter & search logic
  const filteredAgents = agents
    .filter((agent) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        agent.firstName.toLowerCase().includes(searchLower) ||
        agent.lastName.toLowerCase().includes(searchLower) ||
        agent.email.toLowerCase().includes(searchLower) ||
        agent.phone.includes(searchTerm) ||
        (agent.reraNumber && agent.reraNumber.includes(searchTerm)) ||
        (agent.jobTitle && agent.jobTitle.toLowerCase().includes(searchLower));

      const matchesStatus =
        statusFilter === 'all' ? true : agent.status === statusFilter;

      const matchesSpec =
        specialisationFilter === 'all'
          ? true
          : agent.specialisations?.includes(specialisationFilter);

      return matchesSearch && matchesStatus && matchesSpec;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.firstName.localeCompare(b.firstName);
      if (sortBy === 'recent')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'views') return (b.profileViews || 0) - (a.profileViews || 0);
      if (sortBy === 'whatsapp')
        return (b.whatsappClicks || 0) - (a.whatsappClicks || 0);
      return 0;
    });

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      platformStore.deleteAgent(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleToggleConfirm = () => {
    if (toggleTarget) {
      platformStore.toggleAgentStatus(toggleTarget.id);
      setToggleTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Agents Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage public digital business cards, RERA credentials, and QR codes
          </p>
        </div>

        <Link
          href="/admin/agents/new"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black text-xs font-bold transition-all shadow-gold-subtle shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Agent</span>
        </Link>
      </div>

      {/* SEARCH, FILTER & SORT BAR */}
      <div className="p-4 rounded-2xl bg-vb-card border border-vb-border shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or RERA BRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs placeholder:text-slate-500 focus:border-vb-gold outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Specialisation Filter */}
          <div className="sm:col-span-3">
            <select
              value={specialisationFilter}
              onChange={(e) => setSpecialisationFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
            >
              <option value="all">All Specialisations</option>
              {allSpecialisations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
            >
              <option value="views">Most Viewed</option>
              <option value="whatsapp">Most Contacted</option>
              <option value="recent">Recently Added</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-vb-border">
          <span>
            Showing <strong className="text-white">{filteredAgents.length}</strong> of{' '}
            <strong className="text-white">{agents.length}</strong> brokers
          </span>
          {(searchTerm || statusFilter !== 'all' || specialisationFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSpecialisationFilter('all');
              }}
              className="text-vb-gold-light hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* AGENTS MANAGEMENT DATA TABLE */}
      <div className="rounded-3xl bg-vb-card border border-vb-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vb-border bg-vb-navy/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 sm:px-6">Agent Profile</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">RERA BRN</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Engagement</th>
                <th className="py-4 px-4">QR Code</th>
                <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vb-border text-xs">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No agents match your current filters.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => {
                  const fullName = `${agent.firstName} ${agent.lastName}`;
                  return (
                    <tr
                      key={agent.id}
                      className="hover:bg-vb-navy/40 transition-colors group"
                    >
                      {/* Photo & Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={agent.photo}
                            alt={fullName}
                            className="w-11 h-11 rounded-full object-cover border border-vb-border shrink-0"
                          />
                          <div>
                            <Link
                              href={`/admin/agents/${agent.id}/edit`}
                              className="font-bold text-white hover:text-vb-gold-light text-sm block"
                            >
                              {fullName}
                            </Link>
                            <span className="text-[11px] text-vb-gold-champagne font-medium block">
                              {agent.jobTitle}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              /agents/{agent.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-vb-gold-light" />
                            <span>{agent.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[160px]">
                            <Mail className="w-3 h-3 text-vb-gold-light" />
                            <span className="truncate">{agent.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* RERA BRN */}
                      <td className="py-3.5 px-4">
                        {agent.reraNumber ? (
                          <span className="px-2 py-0.5 rounded bg-vb-navy border border-vb-border text-slate-300 font-mono text-[11px]">
                            {agent.reraNumber}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">N/A</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setToggleTarget(agent)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            agent.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-neutral-800 text-slate-400 border border-neutral-700 hover:bg-neutral-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              agent.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                          <span>{agent.status}</span>
                        </button>
                      </td>

                      {/* Engagement Metrics */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">
                            {agent.profileViews.toLocaleString()} views
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold block">
                            {agent.whatsappClicks} WhatsApp
                          </span>
                        </div>
                      </td>

                      {/* QR Quick Action */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/agents/${agent.id}/qr`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-vb-navy hover:bg-vb-border border border-vb-border text-vb-gold-light hover:text-white text-[11px] font-semibold transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Studio</span>
                        </Link>
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/agents/${agent.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-vb-navy hover:bg-vb-border text-slate-300 hover:text-white transition-colors"
                            title="View Public Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/agents/${agent.id}/edit`}
                            className="p-1.5 rounded-lg bg-vb-navy hover:bg-vb-border text-slate-300 hover:text-white transition-colors"
                            title="Edit Agent"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setDeleteTarget(agent)}
                            className="p-1.5 rounded-lg bg-vb-navy hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Agent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Agent Profile?"
        message={`Are you sure you want to permanently delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete Agent"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(toggleTarget)}
        title={`${toggleTarget?.status === 'active' ? 'Deactivate' : 'Activate'} Agent?`}
        message={`Are you sure you want to ${
          toggleTarget?.status === 'active'
            ? 'deactivate this profile? Visitors to this URL will see the unavailable page.'
            : 'activate this profile? The digital card will become publicly accessible.'
        }`}
        confirmLabel={toggleTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        isDestructive={toggleTarget?.status === 'active'}
        onConfirm={handleToggleConfirm}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
