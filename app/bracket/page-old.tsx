'use client';

import { useState } from 'react';
import { useBracket } from '@/hooks/useBracket';
import { ROUND_NAMES } from '@/lib/types';
import type { Game, Team } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

export default function BracketPage() {
  const [userName, setUserName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const {
    games,
    teams,
    picks,
    bracketId,
    isLoading,
    error,
    selectWinner,
    saveBracket,
    createBracket,
    completionPercentage,
  } = useBracket({ userName: hasStarted ? userName : undefined });

  const handleStart = async () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      await createBracket(userName.trim());
      setHasStarted(true);
    } catch (err) {
      console.error('Error creating bracket:', err);
      alert('Failed to create bracket. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      await saveBracket();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Error saving bracket:', err);
      setSaveStatus('error');
      alert('Failed to save bracket. Please try again.');
    }
  };

  // Name entry screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">
            Create Your Bracket
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Enter your name to get started. Pick winners based on mascots!
          </p>

          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleStart}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Picking!
          </button>

          <Link
            href="/"
            className="block text-center mt-4 text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bracket...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md bg-red-50 rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Group games by round
  const gamesByRound = games.reduce((acc, game) => {
    if (!acc[game.round]) {
      acc[game.round] = [];
    }
    acc[game.round].push(game);
    return acc;
  }, {} as Record<string, Game[]>);

  const getTeamById = (id: string | null) => {
    if (!id) return null;
    return teams.find((t) => t.id === id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                {userName}'s Bracket
              </h1>
              <p className="text-gray-600 mt-1">
                Pick your winners - hover over mascots to see team names
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {completionPercentage}%
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  saveStatus === 'saved'
                    ? 'bg-green-600 text-white'
                    : saveStatus === 'saving'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                  ? '✓ Saved!'
                  : 'Save Bracket'}
              </button>

              <Link
                href="/leaderboard"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Games by Round */}
        <div className="space-y-8">
          {Object.entries(gamesByRound).map(([round, roundGames]) => (
            <div key={round} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                {ROUND_NAMES[round as keyof typeof ROUND_NAMES] || round}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roundGames.map((game) => {
                  const team1 = getTeamById(game.team1_id);
                  const team2 = getTeamById(game.team2_id);
                  const selectedTeamId = picks.get(game.id);

                  if (!team1 || !team2) {
                    return (
                      <div
                        key={game.id}
                        className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <p className="text-gray-500 text-center">
                          Awaiting teams...
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={game.id}
                      className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="text-sm text-gray-600 mb-3 text-center font-semibold">
                        Game {game.game_number}
                      </div>

                      <div className="space-y-2">
                        {/* Team 1 */}
                        <MascotButton
                          team={team1}
                          isSelected={selectedTeamId === team1.id}
                          onSelect={() => selectWinner(game.id, team1.id)}
                        />

                        <div className="text-center text-gray-400 font-bold">
                          VS
                        </div>

                        {/* Team 2 */}
                        <MascotButton
                          team={team2}
                          isSelected={selectedTeamId === team2.id}
                          onSelect={() => selectWinner(game.id, team2.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mascot selection button component
function MascotButton({
  team,
  isSelected,
  onSelect,
}: {
  team: Team;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative w-full p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Mascot Image */}
        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={team.mascot_image_url}
            alt={team.mascot_name}
            fill
            className="object-contain p-2"
            onError={(e) => {
              // Fallback for missing images
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                team.mascot_name
              )}&size=128&background=random`;
            }}
          />
        </div>

        {/* Team Info */}
        <div className="flex-1 text-left">
          <div className="font-bold text-lg text-gray-900">
            {team.mascot_name}
          </div>
          <div className="text-sm text-gray-500">Seed: {team.seed}</div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="text-blue-600 text-2xl">✓</div>
        )}
      </div>

      {/* Hover tooltip with team name */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-black text-white px-3 py-1 rounded text-sm whitespace-nowrap">
          {team.name}
        </div>
      </div>
    </button>
  );
}
