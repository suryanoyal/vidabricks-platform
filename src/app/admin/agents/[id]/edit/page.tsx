import React from 'react';
import { INITIAL_AGENTS } from '@/lib/seedData';
import { EditAgentClient } from './EditAgentClient';
import { supabaseApi } from '@/lib/supabase';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const seedIds = INITIAL_AGENTS.map((agent) => ({ id: agent.id }));
  try {
    const cloudAgents = await supabaseApi.fetchAgents();
    if (cloudAgents && cloudAgents.length > 0) {
      const allIds = new Set([
        ...INITIAL_AGENTS.map((a) => a.id),
        ...cloudAgents.map((a) => a.id),
      ]);
      return Array.from(allIds).map((id) => ({ id }));
    }
  } catch (e) {}
  return seedIds;
}

export default function EditAgentPage({ params }: PageProps) {
  return <EditAgentClient id={params.id} />;
}
