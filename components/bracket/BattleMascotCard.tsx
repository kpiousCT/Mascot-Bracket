'use client';

import Image from 'next/image';
import type { Team } from '@/lib/types';
import { useState } from 'react';
import { getSchoolColors } from '@/lib/schoolColors';

interface BattleMascotCardProps {
  team: Team;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'large' | 'huge';
  disabled?: boolean;
}

export function BattleMascotCard({
  team,
  isSelected,
  onSelect,
  size = 'huge',
  disabled = false
}: BattleMascotCardProps) {
  const [imageError, setImageError] = useState(false);
  const schoolColors = getSchoolColors(team.name);

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        group relative flex flex-col overflow-hidden rounded-xl md:rounded-2xl
        transition-all duration-300 ease-out
        ${isSelected
          ? `ring-4 md:ring-8 ${schoolColors.ring} ring-offset-2 md:ring-offset-4 scale-105 shadow-2xl`
          : `ring-2 md:ring-3 ${schoolColors.ring} ring-opacity-50 hover:ring-opacity-100 hover:scale-105 hover:shadow-2xl`
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <>
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full p-2 md:p-3 shadow-xl animate-bounce z-20">
            <svg className="w-5 h-5 md:w-8 md:h-8 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Glow effect when selected */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 animate-pulse"></div>
        </>
      )}

      {/* Mascot Image with School Colors Background */}
      <div
        className={`relative bg-gradient-to-br ${schoolColors.from} ${schoolColors.to} ${
          size === 'huge' ? 'h-[140px] md:h-[220px] w-full' : 'h-[120px] md:h-[180px] w-full'
        }`}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        <Image
          src={imageError ? `https://ui-avatars.com/api/?name=${encodeURIComponent(team.mascot_name)}&size=512&background=random` : team.mascot_image_url}
          alt={team.mascot_name}
          fill
          className="object-contain p-1 md:p-2 relative z-10"
          onError={() => setImageError(true)}
          priority
        />
      </div>

      {/* Team Info */}
      <div className={`text-center space-y-1 py-2 md:py-3 px-2 md:px-4 ${
        isSelected ? 'bg-gradient-to-b from-yellow-50 to-yellow-100' : 'bg-white'
      }`}>
        <div className={`font-bold ${size === 'huge' ? 'text-base md:text-xl' : 'text-sm md:text-lg'} text-gray-900 leading-tight`}>
          {team.mascot_name}
        </div>
        <div className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full ${
          isSelected ? 'bg-yellow-200' : 'bg-gray-100'
        }`}>
          <span className={`${size === 'huge' ? 'text-xs md:text-sm' : 'text-xs'} font-semibold text-gray-700`}>
            Seed #{team.seed}
          </span>
        </div>
        <div className="text-xs font-medium text-gray-600">
          {team.name}
        </div>
        {/* Tap instruction */}
        {!isSelected && !disabled && (
          <div className="pt-1">
            <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Tap to Pick
            </span>
          </div>
        )}
      </div>

      {/* Winner badge */}
      {isSelected && (
        <div className="absolute bottom-1 md:bottom-2 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-3 py-1 md:px-6 md:py-2 rounded-full font-black text-xs md:text-base shadow-2xl border-2 border-yellow-300 animate-pulse">
            🏆 WINNER 🏆
          </div>
        </div>
      )}
    </button>
  );
}
