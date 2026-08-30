'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AgentForm } from '@/components/admin/AgentForm';

export default function NewAgentPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/agents/"
          className="p-2 rounded-xl bg-vb-card hover:bg-vb-card-hover border border-vb-border text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Add New Broker
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create a premium digital business card, unique slug, and high-res QR code
          </p>
        </div>
      </div>

      <AgentForm isEditing={false} />
    </div>
  );
}
