import type {
  BracketPick,
  MasterBracketEntry,
  Game,
  Round,
  LeaderboardScore,
} from '../types';
import { ROUND_POINTS } from '../types';

export interface ScoreBreakdown {
  total_score: number;
  max_possible_score: number;
  correct_picks_by_round: {
    [round: string]: {
      correct: number;
      total: number;
      points: number;
    };
  };
}

/**
 * Calculate score for a bracket based on picks and master bracket results
 */
export function calculateBracketScore(
  picks: BracketPick[],
  masterBracket: MasterBracketEntry[],
  games: Game[]
): ScoreBreakdown {
  const scoreBreakdown: ScoreBreakdown = {
    total_score: 0,
    max_possible_score: 0,
    correct_picks_by_round: {},
  };

  // Create lookup maps for faster access
  const masterMap = new Map(
    masterBracket.map((entry) => [entry.game_id, entry])
  );
  const pickMap = new Map(picks.map((pick) => [pick.game_id, pick]));
  const gameMap = new Map(games.map((game) => [game.id, game]));

  // Group games by round
  const gamesByRound = games.reduce((acc, game) => {
    if (!acc[game.round]) {
      acc[game.round] = [];
    }
    acc[game.round].push(game);
    return acc;
  }, {} as Record<Round, Game[]>);

  // Calculate scores for each round
  for (const [round, roundGames] of Object.entries(gamesByRound)) {
    const roundKey = round as Round;
    const pointValue = ROUND_POINTS[roundKey] || 0;
    let correctCount = 0;
    let completedCount = 0;

    for (const game of roundGames) {
      const masterEntry = masterMap.get(game.id);
      const userPick = pickMap.get(game.id);

      if (masterEntry && masterEntry.winning_team_id && userPick) {
        completedCount++;
        if (userPick.selected_team_id === masterEntry.winning_team_id) {
          correctCount++;
          scoreBreakdown.total_score += pointValue;
        }
      }
    }

    // Store round breakdown
    scoreBreakdown.correct_picks_by_round[round] = {
      correct: correctCount,
      total: roundGames.length,
      points: correctCount * pointValue,
    };

    // Calculate max possible for remaining games
    const remainingGames = roundGames.length - completedCount;
    scoreBreakdown.max_possible_score += remainingGames * pointValue;
  }

  // Max possible includes current score plus remaining games
  scoreBreakdown.max_possible_score += scoreBreakdown.total_score;

  return scoreBreakdown;
}

/**
 * Calculate total possible points for a complete bracket
 */
export function calculateMaxPossiblePoints(games: Game[]): number {
  const gamesByRound = games.reduce((acc, game) => {
    if (!acc[game.round]) {
      acc[game.round] = 0;
    }
    acc[game.round]++;
    return acc;
  }, {} as Record<Round, number>);

  let total = 0;
  for (const [round, count] of Object.entries(gamesByRound)) {
    const roundKey = round as Round;
    const pointValue = ROUND_POINTS[roundKey] || 0;
    total += count * pointValue;
  }

  return total;
}

/**
 * Check if a bracket is complete (all games have picks)
 */
export function isBracketComplete(picks: BracketPick[], games: Game[]): boolean {
  return picks.length === games.length;
}

/**
 * Get percentage completion for a bracket
 */
export function getBracketCompletionPercentage(
  picks: BracketPick[],
  games: Game[]
): number {
  if (games.length === 0) return 0;
  return Math.round((picks.length / games.length) * 100);
}

/**
 * Validate that a pick is valid for a game
 */
export function isValidPick(
  gameId: string,
  teamId: string,
  games: Game[]
): boolean {
  const game = games.find((g) => g.id === gameId);
  if (!game) return false;

  return game.team1_id === teamId || game.team2_id === teamId;
}
