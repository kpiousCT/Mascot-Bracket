'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/hooks/useLeaderboard';

interface ViabilityStatus {
  bracket_id: string;
  user_name: string;
  total_score: number;
  max_possible_score: number;
  rank: number;
  isAlive: boolean;
  isEliminated: boolean;
  isChampionPicked: boolean;
  championTeam: string | null;
  pointsBehindLeader: number;
  canCatchLeader: boolean;
  eliminationReason: string | null;
}

function ViabilityPageContent() {
  const { leaderboard, isLoading, error } = useLeaderboard();
  const [viability, setViability] = useState<ViabilityStatus[]>([]);
  const [filter, setFilter] = useState<'all' | 'alive' | 'eliminated'>('all');

  useEffect(() => {
    if (leaderboard.length === 0) return;

    // Calculate viability for each bracket
    const leader = leaderboard[0];
    const leaderMaxScore = leader.max_possible_score;

    const viabilityData: ViabilityStatus[] = leaderboard.map((entry, index) => {
      const pointsBehindLeader = leader.total_score - entry.total_score;
      const canCatchLeader = entry.max_possible_score >= leader.total_score;

      // Check if championship pick is still alive
      const championPick = entry.championship_pick;
      const isChampionEliminated = championPick ? !championPick.is_alive : false;

      // Determine if bracket is mathematically alive
      const isAlive = canCatchLeader && !isChampionEliminated;
      const isEliminated = !isAlive;

      let eliminationReason = null;
      if (isChampionEliminated) {
        eliminationReason = `Championship pick (${championPick?.team_name || 'Unknown'}) was eliminated`;
      } else if (!canCatchLeader) {
        eliminationReason = `Cannot catch leader (${pointsBehindLeader} pts behind, max ${entry.max_possible_score - entry.total_score} remaining)`;
      }

      return {
        bracket_id: entry.bracket_id,
        user_name: entry.user_name,
        total_score: entry.total_score,
        max_possible_score: entry.max_possible_score,
        rank: index + 1,
        isAlive,
        isEliminated,
        isChampionPicked: !!championPick,
        championTeam: championPick?.team_name || null,
        pointsBehindLeader,
        canCatchLeader,
        eliminationReason,
      };
    });

    setViability(viabilityData);
  }, [leaderboard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 rounded-lg shadow-lg p-8 text-center text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const filteredViability = viability.filter(entry => {
    if (filter === 'alive') return entry.isAlive;
    if (filter === 'eliminated') return entry.isEliminated;
    return true;
  });

  const aliveCount = viability.filter(e => e.isAlive).length;
  const eliminatedCount = viability.filter(e => e.isEliminated).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                💚 Still Alive Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Which brackets can still win the championship?
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              ← Leaderboard
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Still Alive</div>
            <div className="text-4xl font-bold text-green-600">{aliveCount}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((aliveCount / viability.length) * 100).toFixed(0)}% of brackets
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-500 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Eliminated</div>
            <div className="text-4xl font-bold text-red-600">{eliminatedCount}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((eliminatedCount / viability.length) * 100).toFixed(0)}% of brackets
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-500 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Brackets</div>
            <div className="text-4xl font-bold text-blue-600">{viability.length}</div>
            <div className="text-xs text-gray-500 mt-1">Competing for the title</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow p-2 mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Brackets ({viability.length})
          </button>
          <button
            onClick={() => setFilter('alive')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'alive'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💚 Still Alive ({aliveCount})
          </button>
          <button
            onClick={() => setFilter('eliminated')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'eliminated'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ❌ Eliminated ({eliminatedCount})
          </button>
        </div>

        {/* Viability Cards */}
        <div className="space-y-4">
          {filteredViability.map((entry) => (
            <div
              key={entry.bracket_id}
              className={`bg-white rounded-lg shadow-lg p-4 md:p-6 border-2 transition-all hover:shadow-xl ${
                entry.isAlive
                  ? 'border-green-500'
                  : 'border-red-500 opacity-75'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Left Side - User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-400">
                      #{entry.rank}
                    </span>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">
                        {entry.user_name}
                      </h3>
                      {entry.championTeam && (
                        <p className="text-sm text-gray-600">
                          Champion pick: <span className="font-semibold">{entry.championTeam}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {entry.isAlive ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      💚 Still Alive
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        ❌ Eliminated
                      </div>
                      {entry.eliminationReason && (
                        <p className="text-xs text-red-600 mt-1">
                          {entry.eliminationReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side - Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-600">Current Score</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {entry.total_score}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600">Max Possible</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {entry.max_possible_score}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600">Behind Leader</div>
                    <div className={`text-2xl font-bold ${
                      entry.pointsBehindLeader === 0 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {entry.pointsBehindLeader === 0 ? '👑' : entry.pointsBehindLeader}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600">Can Catch?</div>
                    <div className="text-2xl">
                      {entry.canCatchLeader ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      entry.isAlive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(entry.total_score / entry.max_possible_score) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Current progress</span>
                  <span>
                    {((entry.total_score / entry.max_possible_score) * 100).toFixed(1)}% of max
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredViability.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              No brackets found for this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViabilityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ViabilityPageContent />
    </Suspense>
  );
}
