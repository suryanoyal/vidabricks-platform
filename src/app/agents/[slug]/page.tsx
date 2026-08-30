import React from 'react';
import { Metadata } from 'next';
import { INITIAL_AGENTS } from '@/lib/seedData';
import { AgentProfileClient } from './AgentProfileClient';

import { supabaseApi } from '@/lib/supabase';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const seedSlugs = INITIAL_AGENTS.map((agent) => ({ slug: agent.slug }));
  try {
    const cloudAgents = await supabaseApi.fetchAgents();
    if (cloudAgents && cloudAgents.length > 0) {
      const allSlugs = new Set([
        ...INITIAL_AGENTS.map((a) => a.slug),
        ...cloudAgents.map((a) => a.slug),
      ]);
      return Array.from(allSlugs).map((slug) => ({ slug }));
    }
  } catch (e) {
    // fallback to seed
  }
  return seedSlugs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const agent = INITIAL_AGENTS.find(
    (a) => a.slug.toLowerCase() === params.slug.toLowerCase()
  );

  if (!agent) {
    return {
      title: 'Agent Profile | Vidabricks Real Estate Dubai',
      description: 'Connect with a certified luxury property consultant at Vidabricks Real Estate, Dubai.',
    };
  }

  const fullName = `${agent.firstName} ${agent.lastName}`;
  const title = `${fullName} | ${agent.jobTitle} | Vidabricks Real Estate Dubai`;
  const description = `Connect with ${fullName}, ${agent.jobTitle} at Vidabricks Real Estate Dubai. Contact via WhatsApp (${agent.whatsapp || agent.phone}), phone or email for luxury and off-plan Dubai properties.`;
  const url = `https://agents.vidabricks.com/agents/${agent.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Vidabricks Real Estate Dubai',
      images: [
        {
          url: agent.photo || 'https://vidabricks.com/wp-content/uploads/vidabricks-og.jpg',
          width: 800,
          height: 800,
          alt: `${fullName} - Vidabricks Real Estate`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [agent.photo || 'https://vidabricks.com/wp-content/uploads/vidabricks-og.jpg'],
    },
  };
}

export default function AgentPage({ params }: PageProps) {
  const initialAgent = INITIAL_AGENTS.find(
    (a) => a.slug.toLowerCase() === params.slug.toLowerCase()
  );

  const jsonLd = initialAgent
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        name: `${initialAgent.firstName} ${initialAgent.lastName}`,
        jobTitle: initialAgent.jobTitle,
        telephone: initialAgent.phone,
        email: initialAgent.email,
        image: initialAgent.photo,
        url: `https://agents.vidabricks.com/agents/${initialAgent.slug}`,
        worksFor: {
          '@type': 'RealEstateAgent',
          name: 'Vidabricks Real Estate LLC',
          url: 'https://vidabricks.com',
          telephone: '+971547005470',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Tameem House, Barsha Heights',
            addressLocality: 'Dubai',
            addressCountry: 'AE',
          },
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AgentProfileClient initialAgent={initialAgent} slug={params.slug} />
    </>
  );
}
