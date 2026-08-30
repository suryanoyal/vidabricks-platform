'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, Eye } from 'lucide-react';
import { platformStore } from '@/lib/store';
import { Agent } from '@/lib/types';
import { AgentForm } from '@/components/admin/AgentForm';

interface EditAgentClientProps {
  id: string;
}

export const EditAgentClient: React.FC<EditAgentClientProps> = ({ id }) => {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = platformStore.getAgentById(id);
    if (found) {
      setAgent(found);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading agent details...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Agent Not Found</h2>
        <p className="text-xs text-slate-400">The requested agent ID does not exist.</p>
        <Link
          href="/admin/agents"
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
            href="/admin/agents"
            className="p-2 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Edit Agent Profile
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Updating credentials for <strong className="text-white">{agent.firstName} {agent.lastName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/agents/${agent.id}/qr`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-vb-gold-light text-xs font-semibold transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Studio</span>
          </Link>

          <Link
            href={`/agents/${agent.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-white text-xs font-semibold transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Live Card</span>
          </Link>
        </div>
      </div>

      <AgentForm initialData={agent} isEditing={true} />
    </div>
  );
};
