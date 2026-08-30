'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface AgentAvatarProps {
  photo?: string;
  name: string;
  reraNumber?: string;
  size?: 'md' | 'lg' | 'xl';
  showReraBadge?: boolean;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  photo,
  name,
  reraNumber,
  size = 'xl',
  showReraBadge = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-28 h-28 sm:w-32 sm:h-32',
    xl: 'w-32 h-32 sm:w-36 sm:h-36',
  };

  return (
    <div className="relative inline-block mx-auto group">
      {/* Outer Luxury Glow Ring */}
      <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-vb-gold via-vb-gold-champagne to-vb-gold-light opacity-80 blur-[6px] group-hover:opacity-100 transition-opacity" />

      {/* Main Avatar Container */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full p-[3px] bg-gradient-to-b from-vb-gold-champagne via-vb-gold to-vb-gold-dim shadow-2xl overflow-hidden`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-vb-navy flex items-center justify-center">
          {photo && !imageError ? (
            <img
              src={photo}
              alt={name}
              className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-vb-card to-vb-navy flex items-center justify-center font-display font-bold text-2xl text-vb-gold-light">
              {getInitials(name)}
            </div>
          )}
        </div>
      </div>

      {/* Verified RERA Floating Badge */}
      {showReraBadge && reraNumber && (
        <div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-vb-black/90 border border-vb-gold/60 text-vb-gold-champagne text-[10px] font-semibold tracking-wider whitespace-nowrap shadow-lg backdrop-blur-md"
          title={`RERA Certified Broker • BRN ${reraNumber}`}
        >
          <ShieldCheck className="w-3 h-3 text-vb-gold-light flex-shrink-0" />
          <span>BRN: {reraNumber}</span>
        </div>
      )}
    </div>
  );
};
