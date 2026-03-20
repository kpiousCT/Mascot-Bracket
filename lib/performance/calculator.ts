import type { LeaderboardScore, Round } from '@/lib/types';

export interface RoundStats {
  correct: number;
  total: number;
  points: number;
  percentage: number;
}

export interface PerformanceData {
  userName: string;
  bracketId: string;
  roundStats: Record<string, RoundStats>;
  totalScore: number;
  bestRound: string | null;
  worstRound: string | null;
}

/**
 * Calculate average performance across all brackets for each round
 */
export function calculateAveragePerformance(
  leaderboard: LeaderboardScore[]
): Record<string, number> {
  if (leaderboard.length === 0) return {};

  const roundAverages: Record<string, { sum: number; count: number }> = {};

  leaderboard.forEach(entry => {
    Object.entries(entry.correct_picks_by_round).forEach(([round, stats]) => {
      if (!roundAverages[round]) {
        roundAverages[round] = { sum: 0, count: 0 };
      }
      const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      roundAverages[round].sum += percentage;
      roundAverages[round].count += 1;
    });
  });

  const averages: Record<string, number> = {};
  Object.entries(roundAverages).forEach(([round, data]) => {
    averages[round] = data.count > 0 ? data.sum / data.count : 0;
  });

  return averages;
}

/**
 * Get performance data for a specific user
 */
export function getUserPerformance(
  entry: LeaderboardScore
): PerformanceData {
  const roundStats: Record<string, RoundStats> = {};
  let bestRound: string | null = null;
  let worstRound: string | null = null;
  let bestPercentage = -1;
  let worstPercentage = 101;

  Object.entries(entry.correct_picks_by_round).forEach(([round, stats]) => {
    const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

    roundStats[round] = {
      correct: stats.correct,
      total: stats.total,
      points: stats.points,
      percentage,
    };

    // Track best and worst rounds (only if games have been played)
    if (stats.total > 0) {
      if (percentage > bestPercentage) {
        bestPercentage = percentage;
        bestRound = round;
      }
      if (percentage < worstPercentage) {
        worstPercentage = percentage;
        worstRound = round;
      }
    }
  });

  return {
    userName: entry.user_name,
    bracketId: entry.bracket_id,
    roundStats,
    totalScore: entry.total_score,
    bestRound,
    worstRound,
  };
}

/**
 * Compare user performance to pool average
 */
export function compareToAverage(
  userPercentage: number,
  average: number
): {
  difference: number;
  better: boolean;
} {
  const difference = userPercentage - average;
  return {
    difference: Math.abs(difference),
    better: difference > 0,
  };
}
