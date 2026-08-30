'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Eye } from 'lucide-react';
import { platformStore } from '@/lib/store';
import { Agent } from '@/lib/types';
import { QRStudio } from '@/components/admin/QRStudio';
import { supabase, mapDbAgentToAgent, isSupabaseConfigured } from '@/lib/supabase';

interface AgentQRClientProps {
  id: string;
}

export const AgentQRClient: React.FC<AgentQRClientProps> = ({ id }) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try local memory store by ID or slug
    const found = platformStore.getAgentById(id) || platformStore.getAgentBySlug(id);
    if (found) {
      setAgent(found);
      setLoading(false);
    }

    // 2. Fetch fresh from Supabase by ID or slug
    const fetchCloudAgent = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('agents')
            .select('*')
            .or(`id.eq.${id},slug.eq.${id}`)
            .maybeSingle();

          if (data && !error) {
            const mapped = mapDbAgentToAgent(data);
            setAgent(mapped);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase agent fetch error in QR studio:', e);
        }
      }
      setLoading(false);
    };

    fetchCloudAgent();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-vb-gold-light text-sm font-semibold flex items-center justify-center gap-3 animate-pulse">
        <div className="w-5 h-5 rounded-full border-2 border-vb-gold border-t-transparent animate-spin" />
        <span>Loading QR Code Studio...</span>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Agent Not Found</h2>
        <p className="text-xs text-slate-400">Could not find the agent to generate QR codes.</p>
        <Link
          href="/admin/agents/"
          className="inline-block px-4 py-2 rounded-xl bg-vb-gold text-vb-black font-bold text-xs"
        >
          Return to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/agents/"
            className="p-2 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              QR Code Studio
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Marketing materials & high-res QR generation for <strong className="text-white">{agent.firstName} {agent.lastName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/agents/${agent.id}/edit/`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>

          <Link
            href={`/agents/${agent.slug}/`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-white text-xs font-semibold transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Live Card</span>
          </Link>
        </div>
      </div>

      <QRStudio agent={agent} />
    </div>
  );
};
