'use client';

import Image from 'next/image';
import type { Team } from '@/lib/types';
import { useState } from 'react';

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

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        group relative flex flex-col items-center gap-2 md:gap-4 p-3 md:p-6 rounded-xl md:rounded-2xl
        transition-all duration-300 ease-out
        ${isSelected
          ? 'ring-4 md:ring-8 ring-yellow-400 ring-offset-2 md:ring-offset-4 scale-105 shadow-xl md:shadow-2xl bg-yellow-50'
          : 'ring-1 md:ring-2 ring-gray-300 hover:ring-blue-400 hover:scale-105 hover:shadow-xl bg-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-yellow-400 rounded-full p-2 md:p-3 shadow-lg animate-bounce">
          <svg className="w-4 h-4 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Mascot Image */}
      <div
        className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ${
          size === 'huge' ? 'w-[180px] h-[180px] md:w-[300px] md:h-[300px]' : 'w-[140px] h-[140px] md:w-[200px] md:h-[200px]'
        }`}
      >
        <Image
          src={imageError ? `https://ui-avatars.com/api/?name=${encodeURIComponent(team.mascot_name)}&size=512&background=random` : team.mascot_image_url}
          alt={team.mascot_name}
          fill
          className="object-contain p-4"
          onError={() => setImageError(true)}
          priority
        />
      </div>

      {/* Team Info */}
      <div className="text-center space-y-1 md:space-y-2 pb-4 md:pb-8">
        <div className={`font-bold ${size === 'huge' ? 'text-xl md:text-3xl' : 'text-lg md:text-2xl'} text-gray-900`}>
          {team.mascot_name}
        </div>
        <div className={`${size === 'huge' ? 'text-base md:text-xl' : 'text-sm md:text-lg'} text-gray-600`}>
          Seed #{team.seed}
        </div>
        <div className="text-xs md:text-sm text-gray-500">
          {team.name}
        </div>
        {/* Tap instruction - now part of team info for proper spacing */}
        {!isSelected && !disabled && (
          <div className="pt-1 md:pt-2">
            <span className="text-xs md:text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Tap to Pick! 👆
            </span>
          </div>
        )}
      </div>

      {/* Winner badge */}
      {isSelected && (
        <div className="absolute -bottom-1 md:-bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 md:px-6 md:py-2 rounded-full font-bold text-xs md:text-lg shadow-lg">
          🏆 WINNER!
        </div>
      )}
    </button>
  );
}
