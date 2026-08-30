'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { SocialLinks, Agent } from '@/lib/types';
import { platformStore } from '@/lib/store';
import {
  InstagramIcon,
  LinkedinIcon,
  TwitterXIcon,
  FacebookIcon,
  YoutubeIcon,
  TikTokIcon,
} from '@/components/ui/BrandIcons';

interface SocialLinksGridProps {
  social?: SocialLinks;
  agent: Agent;
}

export const SocialLinksGrid: React.FC<SocialLinksGridProps> = ({ social, agent }) => {
  if (!social) return null;

  const platforms = [
    {
      key: 'instagram',
      name: 'Instagram',
      url: social.instagram,
      icon: InstagramIcon,
      color: 'hover:text-[#E4405F] hover:border-[#E4405F]/50',
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      url: social.linkedin,
      icon: LinkedinIcon,
      color: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/50',
    },
    {
      key: 'tiktok',
      name: 'TikTok',
      url: social.tiktok,
      icon: TikTokIcon,
      color: 'hover:text-[#ff0050] hover:border-[#ff0050]/50',
    },
    {
      key: 'youtube',
      name: 'YouTube',
      url: social.youtube,
      icon: YoutubeIcon,
      color: 'hover:text-[#FF0000] hover:border-[#FF0000]/50',
    },
    {
      key: 'facebook',
      name: 'Facebook',
      url: social.facebook,
      icon: FacebookIcon,
      color: 'hover:text-[#1877F2] hover:border-[#1877F2]/50',
    },
    {
      key: 'x',
      name: 'X',
      url: social.x,
      icon: TwitterXIcon,
      color: 'hover:text-white hover:border-white/50',
    },
    {
      key: 'website',
      name: 'Website',
      url: social.website,
      icon: Globe,
      color: 'hover:text-vb-gold-light hover:border-vb-gold/50',
    },
  ].filter((p) => Boolean(p.url));

  if (platforms.length === 0) return null;

  const handleClick = (platformName: string) => {
    platformStore.trackEvent(agent.id, 'social_click', { platform: platformName });
  };

  return (
    <div className="w-full pt-4 border-t border-vb-border/70">
      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-vb-grey-text block text-center mb-3">
        Connect Online
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(p.name)}
              className={`p-2.5 rounded-xl bg-vb-card/80 border border-vb-border text-slate-400 ${p.color} transition-all active:scale-95 group shadow-sm`}
              title={`${agent.firstName} on ${p.name}`}
            >
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
