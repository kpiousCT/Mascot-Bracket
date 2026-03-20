'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { RoundCard } from '@/components/performance/RoundCard';
import {
  calculateAveragePerformance,
  getUserPerformance,
  type PerformanceData,
} from '@/lib/performance/calculator';
import { ROUND_NAMES } from '@/lib/types';

function PerformancePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get('userName');

  const { leaderboard, isLoading, error } = useLeaderboard();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [averages, setAverages] = useState<Record<string, number>>({});

  useEffect(() => {
    if (leaderboard.length === 0) return;

    // Calculate pool averages
    const poolAverages = calculateAveragePerformance(leaderboard);
    setAverages(poolAverages);

    // Get user-specific performance
    if (userName) {
      const userEntry = leaderboard.find(entry => entry.user_name === userName);
      if (userEntry) {
        const userData = getUserPerformance(userEntry);
        setPerformanceData(userData);
      }
    } else {
      // Default to first place if no user specified
      const userData = getUserPerformance(leaderboard[0]);
      setPerformanceData(userData);
    }
  }, [leaderboard, userName]);

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

  if (!performanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-600">
            <p className="text-xl mb-4">No performance data available yet.</p>
            <Link href="/leaderboard" className="text-blue-600 hover:underline">
              ← Back to Leaderboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get rounds in order
  const roundOrder = ['round_64', 'round_32', 'sweet_16', 'elite_8', 'final_4', 'championship'];
  const availableRounds = roundOrder.filter(round => performanceData.roundStats[round]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                📊 Round Performance
              </h1>
              <p className="text-gray-600 mt-1">
                {performanceData.userName}'s detailed breakdown
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/leaderboard"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                ← Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Score</div>
            <div className="text-4xl font-bold text-blue-600">
              {performanceData.totalScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">Points earned so far</div>
          </div>

          {performanceData.bestRound && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Best Round</div>
              <div className="text-2xl font-bold text-green-700">
                {ROUND_NAMES[performanceData.bestRound as keyof typeof ROUND_NAMES]}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {performanceData.roundStats[performanceData.bestRound].percentage.toFixed(0)}%
                correct
              </div>
            </div>
          )}

          {performanceData.worstRound && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Worst Round</div>
              <div className="text-2xl font-bold text-red-700">
                {ROUND_NAMES[performanceData.worstRound as keyof typeof ROUND_NAMES]}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {performanceData.roundStats[performanceData.worstRound].percentage.toFixed(0)}%
                correct
              </div>
            </div>
          )}
        </div>

        {/* User Selector (for switching between users) */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View Performance For:
          </label>
          <select
            value={performanceData.userName}
            onChange={(e) => {
              router.push(`/leaderboard/performance?userName=${encodeURIComponent(e.target.value)}`);
            }}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {leaderboard.map(entry => (
              <option key={entry.bracket_id} value={entry.user_name}>
                {entry.user_name} ({entry.total_score} pts)
              </option>
            ))}
          </select>
        </div>

        {/* Round Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {availableRounds.map(round => (
            <RoundCard
              key={round}
              round={round}
              stats={performanceData.roundStats[round]}
              average={averages[round] || 0}
              isBest={round === performanceData.bestRound}
              isWorst={round === performanceData.worstRound}
            />
          ))}
        </div>

        {availableRounds.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              No games have been completed yet.
            </p>
            <p className="text-sm text-gray-500">
              Performance data will appear here once the tournament starts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PerformancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PerformancePageContent />
    </Suspense>
  );
}
