import React from 'react';
import { INITIAL_AGENTS } from '@/lib/seedData';
import { EditAgentClient } from './EditAgentClient';

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

export default function EditAgentPage({ params }: PageProps) {
  return <EditAgentClient id={params.id} />;
}
