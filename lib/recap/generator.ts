import type { DailyRecap, Game, Team, MasterBracketEntry, UpsetInfo } from '@/lib/types';
import { getGames, getTeams, getMasterBracket, getLeaderboardHistory, getAllBracketsWithPicks } from '@/lib/db/client';

interface InternalUpsetInfo {
  game: Game;
  winner: Team;
  loser: Team;
  seedDiff: number;
  description: string;
}

interface RankChangeInfo {
  user: string;
  previousRank: number;
  newRank: number;
  change: number;
}

/**
 * Get games completed on a specific date
 */
async function getGamesCompletedOnDate(date: Date): Promise<MasterBracketEntry[]> {
  const masterBracket = await getMasterBracket();
  const targetDate = date.toISOString().split('T')[0]; // YYYY-MM-DD

  return masterBracket.filter(entry => {
    if (!entry.completed_at) return false;
    const completedDate = new Date(entry.completed_at).toISOString().split('T')[0];
    return completedDate === targetDate;
  });
}

/**
 * Identify upsets from completed games
 */
async function findUpsets(completedGames: MasterBracketEntry[]): Promise<InternalUpsetInfo[]> {
  const games = await getGames();
  const teams = await getTeams();
  const upsets: InternalUpsetInfo[] = [];

  for (const result of completedGames) {
    const game = games.find(g => g.id === result.game_id);
    if (!game || !result.winning_team_id) continue;

    const team1 = teams.find(t => t.id === game.team1_id);
    const team2 = teams.find(t => t.id === game.team2_id);
    if (!team1 || !team2) continue;

    // Determine winner and loser
    let winner: Team;
    let loser: Team;

    if (result.winning_team_id === team1.id) {
      winner = team1;
      loser = team2;
    } else {
      winner = team2;
      loser = team1;
    }

    // An upset is when a HIGHER seed number beats a LOWER seed number
    // (Lower seed number = better team: 1 seed is best, 16 seed is worst)
    // Example: 15 seed beating 2 seed is an upset
    if (winner.seed > loser.seed) {
      const seedDiff = winner.seed - loser.seed;
      upsets.push({
        game,
        winner,
        loser,
        seedDiff,
        description: `${winner.seed} seed ${winner.name} beat ${loser.seed} seed ${loser.name}`,
      });
    }
  }

  // Sort by seed difference (biggest upsets first)
  return upsets.sort((a, b) => b.seedDiff - a.seedDiff);
}

/**
 * Enrich upsets with bracket pick information
 */
async function enrichUpsetsWithPicks(upsets: InternalUpsetInfo[]): Promise<UpsetInfo[]> {
  const bracketsWithPicks = await getAllBracketsWithPicks();
  const totalBrackets = bracketsWithPicks.length;

  return upsets.map(upset => {
    // Find brackets that picked the upset winner for this game
    const bracketsWhoPicked = bracketsWithPicks
      .filter(bracket => {
        const pick = bracket.picks.find(p => p.game_id === upset.game.id);
        return pick && pick.selected_team_id === upset.winner.id;
      })
      .map(bracket => bracket.user_name);

    return {
      winner_name: upset.winner.name,
      winner_seed: upset.winner.seed,
      loser_name: upset.loser.name,
      loser_seed: upset.loser.seed,
      seed_diff: upset.seedDiff,
      description: upset.description,
      brackets_who_picked: bracketsWhoPicked,
      pick_count: bracketsWhoPicked.length,
      total_brackets: totalBrackets,
    };
  });
}

/**
 * Calculate rank changes between two snapshots
 */
async function calculateRankChanges(date: Date): Promise<RankChangeInfo[]> {
  const history = await getLeaderboardHistory();
  if (history.length === 0) return [];

  // Get snapshots from today and yesterday
  const targetDate = date.toISOString().split('T')[0];
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split('T')[0];

  const todaySnapshot = history.filter(h =>
    h.snapshot_time.startsWith(targetDate)
  );
  const yesterdaySnapshot = history.filter(h =>
    h.snapshot_time.startsWith(yesterdayDate)
  );

  if (todaySnapshot.length === 0 || yesterdaySnapshot.length === 0) {
    return [];
  }

  const changes: RankChangeInfo[] = [];

  for (const today of todaySnapshot) {
    const yesterday = yesterdaySnapshot.find(y => y.bracket_id === today.bracket_id);
    if (yesterday && yesterday.rank !== today.rank) {
      changes.push({
        user: today.user_name,
        previousRank: yesterday.rank,
        newRank: today.rank,
        change: yesterday.rank - today.rank, // positive = moved up
      });
    }
  }

  // Sort by magnitude of change
  return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

/**
 * Build summary text from recap data
 */
function buildSummaryText(data: {
  gamesCount: number;
  upsets: InternalUpsetInfo[];
  rankChanges: RankChangeInfo[];
  eliminations: number;
}): string {
  const parts: string[] = [];

  // Games completed
  if (data.gamesCount > 0) {
    parts.push(`${data.gamesCount} game${data.gamesCount === 1 ? '' : 's'} completed.`);
  }

  // Biggest upset
  if (data.upsets.length > 0) {
    const biggest = data.upsets[0];
    parts.push(
      `Biggest upset: ${biggest.winner.seed} seed ${biggest.winner.name} ${biggest.winner.mascot_name} defeated ${biggest.loser.seed} seed ${biggest.loser.name}.`
    );
  }

  // Rank changes
  if (data.rankChanges.length > 0) {
    const biggest = data.rankChanges[0];
    if (biggest.change > 0) {
      parts.push(
        `${biggest.user} made the biggest move, jumping from ${biggest.previousRank}${getOrdinalSuffix(biggest.previousRank)} to ${biggest.newRank}${getOrdinalSuffix(biggest.newRank)} place!`
      );
    } else {
      parts.push(
        `${biggest.user} dropped from ${biggest.previousRank}${getOrdinalSuffix(biggest.previousRank)} to ${biggest.newRank}${getOrdinalSuffix(biggest.newRank)} place.`
      );
    }
  }

  // Eliminations
  if (data.eliminations > 0) {
    parts.push(
      `${data.eliminations} bracket${data.eliminations === 1 ? '' : 's'} saw ${data.eliminations === 1 ? 'its' : 'their'} championship pick eliminated.`
    );
  }

  return parts.join(' ');
}

/**
 * Helper to get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

/**
 * Generate a daily recap for a specific date
 */
export async function generateDailyRecap(date: Date): Promise<Omit<DailyRecap, 'id' | 'generated_at'>> {
  // Get completed games for this date
  const todaysGames = await getGamesCompletedOnDate(date);

  // Find upsets (internal format)
  const internalUpsets = await findUpsets(todaysGames);

  // Enrich upsets with bracket pick information
  const allUpsets = await enrichUpsetsWithPicks(internalUpsets);

  // Calculate rank changes
  const rankChanges = await calculateRankChanges(date);

  // Get total games completed
  const masterBracket = await getMasterBracket();
  const totalCompleted = masterBracket.filter(e => e.winning_team_id !== null).length;

  // For now, eliminations tracking would require comparing viability before/after
  // This is complex, so we'll leave it as 0 for now and can enhance later
  const newEliminations = 0;
  const eliminatedBrackets: string[] = [];

  // Build summary text
  const summary = buildSummaryText({
    gamesCount: todaysGames.length,
    upsets: internalUpsets,
    rankChanges,
    eliminations: newEliminations,
  });

  return {
    recap_date: date.toISOString().split('T')[0],
    games_completed_today: todaysGames.length,
    total_games_completed: totalCompleted,
    biggest_upset: internalUpsets.length > 0 ? internalUpsets[0].description : null,
    biggest_upset_seed_diff: internalUpsets.length > 0 ? internalUpsets[0].seedDiff : null,
    all_upsets: allUpsets,
    biggest_rank_change: rankChanges.length > 0 ? rankChanges[0] : null,
    new_eliminations: newEliminations,
    eliminated_brackets: eliminatedBrackets,
    summary_text: summary,
  };
}
