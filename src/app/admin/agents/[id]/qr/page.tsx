import React from 'react';
import { INITIAL_AGENTS } from '@/lib/seedData';
import { AgentQRClient } from './AgentQRClient';

interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return INITIAL_AGENTS.map((agent) => ({
    id: agent.id,
  }));
}

export default function AgentQRPage({ params }: PageProps) {
  return <AgentQRClient id={params.id} />;
}
