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
  const imageSize = size === 'huge' ? 300 : 200;

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        group relative flex flex-col items-center gap-4 p-6 rounded-2xl
        transition-all duration-300 ease-out
        ${isSelected
          ? 'ring-8 ring-yellow-400 ring-offset-4 scale-105 shadow-2xl bg-yellow-50'
          : 'ring-2 ring-gray-300 hover:ring-blue-400 hover:scale-105 hover:shadow-xl bg-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        min-h-[${imageSize + 120}px]
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Mascot Image */}
      <div
        className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`}
        style={{ width: imageSize, height: imageSize }}
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
      <div className="text-center space-y-2">
        <div className={`font-bold ${size === 'huge' ? 'text-3xl' : 'text-2xl'} text-gray-900`}>
          {team.mascot_name}
        </div>
        <div className={`${size === 'huge' ? 'text-xl' : 'text-lg'} text-gray-600`}>
          Seed #{team.seed}
        </div>
        <div className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          {team.name}
        </div>
      </div>

      {/* Tap instruction */}
      {!isSelected && !disabled && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Tap to Pick! 👆
          </span>
        </div>
      )}

      {/* Winner badge */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
          🏆 WINNER!
        </div>
      )}
    </button>
  );
}
