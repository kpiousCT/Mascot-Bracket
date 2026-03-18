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

// School color mappings
const getSchoolColors = (teamName: string): { from: string; to: string; ring: string } => {
  const colors: Record<string, { from: string; to: string; ring: string }> = {
    'Duke': { from: 'from-blue-700', to: 'to-blue-900', ring: 'ring-blue-600' },
    'Siena': { from: 'from-green-600', to: 'to-yellow-600', ring: 'ring-green-500' },
    'UConn': { from: 'from-blue-800', to: 'to-blue-950', ring: 'ring-blue-700' },
    'Kansas': { from: 'from-blue-600', to: 'to-red-600', ring: 'ring-blue-500' },
    'North Carolina': { from: 'from-sky-400', to: 'to-sky-600', ring: 'ring-sky-500' },
    'Kentucky': { from: 'from-blue-700', to: 'to-blue-900', ring: 'ring-blue-600' },
    'Michigan': { from: 'from-blue-600', to: 'to-yellow-500', ring: 'ring-blue-500' },
    'Michigan State': { from: 'from-green-700', to: 'to-green-900', ring: 'ring-green-600' },
    'Villanova': { from: 'from-blue-600', to: 'to-blue-800', ring: 'ring-blue-600' },
    'Florida': { from: 'from-orange-600', to: 'to-blue-700', ring: 'ring-orange-500' },
    'Alabama': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
    'Gonzaga': { from: 'from-blue-800', to: 'to-red-700', ring: 'ring-blue-700' },
    'Purdue': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-600' },
    'Arizona': { from: 'from-red-700', to: 'to-blue-900', ring: 'ring-red-600' },
    'Houston': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
    'Tennessee': { from: 'from-orange-600', to: 'to-orange-800', ring: 'ring-orange-500' },
    'Texas': { from: 'from-orange-600', to: 'to-orange-800', ring: 'ring-orange-500' },
    'UCLA': { from: 'from-blue-500', to: 'to-yellow-500', ring: 'ring-blue-500' },
    'Arkansas': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
    'Iowa State': { from: 'from-red-700', to: 'to-yellow-600', ring: 'ring-red-600' },
    'Iowa': { from: 'from-yellow-500', to: 'to-gray-800', ring: 'ring-yellow-500' },
    'Ohio State': { from: 'from-red-700', to: 'to-gray-700', ring: 'ring-red-600' },
    'Virginia': { from: 'from-orange-600', to: 'to-blue-800', ring: 'ring-orange-500' },
    'Wisconsin': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
    'Illinois': { from: 'from-orange-600', to: 'to-blue-800', ring: 'ring-orange-500' },
    'Miami': { from: 'from-orange-600', to: 'to-green-700', ring: 'ring-orange-500' },
    'BYU': { from: 'from-blue-700', to: 'to-blue-900', ring: 'ring-blue-600' },
    'TCU': { from: 'from-purple-700', to: 'to-purple-900', ring: 'ring-purple-600' },
    'Georgia': { from: 'from-red-700', to: 'to-gray-800', ring: 'ring-red-600' },
    'Clemson': { from: 'from-orange-600', to: 'to-purple-700', ring: 'ring-orange-500' },
    'Texas A&M': { from: 'from-red-900', to: 'to-gray-800', ring: 'ring-red-800' },
    'Texas Tech': { from: 'from-red-700', to: 'to-gray-800', ring: 'ring-red-600' },
    'VCU': { from: 'from-gray-800', to: 'to-yellow-600', ring: 'ring-gray-700' },
    'Missouri': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-500' },
    'Louisville': { from: 'from-red-700', to: 'to-gray-800', ring: 'ring-red-600' },
    'Vanderbilt': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-600' },
  };

  return colors[teamName] || { from: 'from-indigo-600', to: 'to-purple-700', ring: 'ring-indigo-500' };
};

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
          size === 'huge' ? 'w-full aspect-square' : 'w-full aspect-square'
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
          className="object-contain p-2 md:p-4 relative z-10"
          onError={() => setImageError(true)}
          priority
        />
      </div>

      {/* Team Info */}
      <div className={`text-center space-y-1 md:space-y-2 py-3 md:py-6 px-3 md:px-6 ${
        isSelected ? 'bg-gradient-to-b from-yellow-50 to-yellow-100' : 'bg-white'
      }`}>
        <div className={`font-bold ${size === 'huge' ? 'text-lg md:text-2xl' : 'text-base md:text-xl'} text-gray-900`}>
          {team.mascot_name}
        </div>
        <div className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full ${
          isSelected ? 'bg-yellow-200' : 'bg-gray-100'
        }`}>
          <span className={`${size === 'huge' ? 'text-sm md:text-base' : 'text-xs md:text-sm'} font-semibold text-gray-700`}>
            Seed #{team.seed}
          </span>
        </div>
        <div className="text-xs md:text-sm font-medium text-gray-600">
          {team.name}
        </div>
        {/* Tap instruction */}
        {!isSelected && !disabled && (
          <div className="pt-2">
            <span className="text-xs md:text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              👆 Tap to Pick
            </span>
          </div>
        )}
      </div>

      {/* Winner badge */}
      {isSelected && (
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-4 py-1.5 md:px-8 md:py-3 rounded-full font-black text-sm md:text-xl shadow-2xl border-2 border-yellow-300 animate-pulse">
            🏆 WINNER 🏆
          </div>
        </div>
      )}
    </button>
  );
}
