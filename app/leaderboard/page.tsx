'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { ROUND_NAMES, type RankChange } from '@/lib/types';
import { getLatestSnapshot } from '@/lib/db/client';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { leaderboard, isLoading, error } = useLeaderboard();
  const [rankChanges, setRankChanges] = useState<Map<string, RankChange>>(new Map());

  // Calculate rank changes when leaderboard updates
  useEffect(() => {
    async function calculateRankChanges() {
      if (leaderboard.length === 0) return;

      try {
        const snapshot = await getLatestSnapshot();
        const changes = new Map<string, RankChange>();

        leaderboard.forEach((entry, currentIndex) => {
          const currentRank = currentIndex + 1;
          const previousEntry = snapshot.find((s: any) => s.bracket_id === entry.bracket_id);

          if (previousEntry) {
            const change: RankChange = {
              bracket_id: entry.bracket_id,
              previous_rank: previousEntry.rank,
              current_rank: currentRank,
              change: previousEntry.rank - currentRank, // positive = moved up
            };
            changes.set(entry.bracket_id, change);
          }
        });

        setRankChanges(changes);
      } catch (err) {
        console.error('Error calculating rank changes:', err);
      }
    }

    calculateRankChanges();
  }, [leaderboard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-900 mb-8">Leaderboard</h1>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-900 mb-8">Leaderboard</h1>
          <div className="bg-red-50 rounded-lg shadow-lg p-8 text-center text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900">🏆 Leaderboard</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Home
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-600">
            <p className="text-xl mb-4">No brackets submitted yet!</p>
            <Link
              href="/bracket"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your Bracket
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Rank</th>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-center">Total Score</th>
                    <th className="px-6 py-4 text-center">Max Possible</th>
                    <th className="px-6 py-4 text-center">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {leaderboard.map((entry, index) => (
                      <React.Fragment key={entry.bracket_id}>
                        <motion.tr
                          layout
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                            layout: { duration: 0.4 }
                          }}
                          className={`border-b hover:bg-gray-50 ${
                            index === 0 ? 'bg-yellow-50' : ''
                          }`}
                        >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            <span className="font-semibold text-lg">
                              {index + 1}
                            </span>
                            {(() => {
                              const change = rankChanges.get(entry.bracket_id);
                              if (!change || change.change === 0) return null;

                              if (change.change > 0) {
                                return (
                                  <span className="text-green-600 text-sm font-semibold flex items-center">
                                    ↑{change.change}
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="text-red-600 text-sm font-semibold flex items-center">
                                    ↓{Math.abs(change.change)}
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/bracket/overview?userName=${encodeURIComponent(entry.user_name)}&readonly=true`}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {entry.user_name}
                            </Link>
                            {!entry.is_locked && (
                              <Link
                                href={`/bracket/overview?userName=${encodeURIComponent(entry.user_name)}`}
                                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                ✏️ Edit
                              </Link>
                            )}
                            {entry.is_locked && (
                              <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                                🔒 Locked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {entry.total_score}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg text-gray-600">
                            {entry.max_possible_score}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                            onClick={() => {
                              const detailsRow = document.getElementById(
                                `details-${entry.bracket_id}`
                              );
                              if (detailsRow) {
                                detailsRow.classList.toggle('hidden');
                              }
                            }}
                          >
                            View Scoring Breakdown
                          </button>
                        </td>
                      </motion.tr>
                      {/* Expandable details row directly under this entry */}
                      <motion.tr
                        id={`details-${entry.bracket_id}`}
                        layout
                        className="hidden border-b bg-gray-50"
                      >
                        <td colSpan={5} className="px-6 py-4">
                          <h4 className="font-semibold mb-2 text-gray-700">
                            Round Breakdown for {entry.user_name}:
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(entry.correct_picks_by_round).map(
                              ([round, stats]) => (
                                <div
                                  key={round}
                                  className="bg-white rounded p-3 shadow-sm"
                                >
                                  <div className="text-sm font-medium text-gray-600 mb-1">
                                    {ROUND_NAMES[round as keyof typeof ROUND_NAMES] ||
                                      round}
                                  </div>
                                  <div className="text-lg">
                                    <span className="font-bold text-blue-600">
                                      {stats.correct}
                                    </span>
                                    <span className="text-gray-500">
                                      /{stats.total}
                                    </span>
                                    <span className="text-sm text-gray-600 ml-2">
                                      ({stats.points} pts)
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </td>
                      </motion.tr>
                      </React.Fragment>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600 text-center">
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></span>
              Live updates enabled - scores refresh automatically
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
