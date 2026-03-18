'use client';

import { ROUND_NAMES } from '@/lib/types';

interface GameProgressBarProps {
  currentGame: number;
  totalGames: number;
  roundName: string;
  hasCurrentGamePick?: boolean;
}

export function GameProgressBar({ currentGame, totalGames, roundName, hasCurrentGamePick = false }: GameProgressBarProps) {
  // Don't count the current game as complete unless it has a pick
  const completedGames = hasCurrentGamePick ? currentGame : currentGame - 1;
  const percentage = Math.round((completedGames / totalGames) * 100);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 space-y-3">
      {/* Game counter and round */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            Game {currentGame} of {totalGames}
          </div>
          <div className="text-sm text-gray-600">
            {ROUND_NAMES[roundName as keyof typeof ROUND_NAMES] || roundName}
          </div>
        </div>
        <div className="text-4xl font-bold text-blue-600">
          {percentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
        </div>

        {/* Progress text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700 drop-shadow-sm">
            {currentGame}/{totalGames} complete
          </span>
        </div>
      </div>

      {/* Milestone indicators */}
      {percentage >= 100 && (
        <div className="flex items-center justify-center gap-2 text-green-600 font-semibold animate-bounce">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Bracket Complete! 🎉</span>
        </div>
      )}
    </div>
  );
}
