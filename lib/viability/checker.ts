import type { BracketViability, Game, MasterBracketEntry } from '@/lib/types';

/**
 * Check if a team is eliminated based on master bracket results
 */
export function isTeamEliminated(
  teamId: string,
  games: Game[],
  masterBracket: MasterBracketEntry[]
): boolean {
  // Find any game where this team participated and lost
  const teamGames = games.filter(
    game => game.team1_id === teamId || game.team2_id === teamId
  );

  for (const game of teamGames) {
    const result = masterBracket.find(mb => mb.game_id === game.id);
    if (result && result.winning_team_id) {
      // Team lost if the winner is not this team
      if (result.winning_team_id !== teamId) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a team can still reach the championship
 */
export function canReachChampionship(
  teamId: string,
  games: Game[],
  masterBracket: MasterBracketEntry[]
): boolean {
  // If team is already eliminated, they can't reach championship
  if (isTeamEliminated(teamId, games, masterBracket)) {
    return false;
  }

  // Find the championship game
  const championshipGame = games.find(g => g.round === 'championship');
  if (!championshipGame) return true; // No championship game yet, all alive

  // Check if championship game has been played
  const championshipResult = masterBracket.find(
    mb => mb.game_id === championshipGame.id
  );

  if (championshipResult && championshipResult.winning_team_id) {
    // Championship decided - only winner is "alive"
    return championshipResult.winning_team_id === teamId;
  }

  // Championship not decided yet, team is still in contention if not eliminated
  return true;
}

/**
 * Calculate bracket viability based on championship and Final Four picks
 */
export async function checkBracketViability(
  bracketId: string,
  picks: Map<string, string>, // gameId -> teamId
  games: Game[],
  masterBracket: MasterBracketEntry[]
): Promise<BracketViability> {
  // Find championship game and user's pick
  const championshipGame = games.find(g => g.round === 'championship');
  let championStillAlive = true;

  if (championshipGame) {
    const championPick = picks.get(championshipGame.id);
    if (championPick) {
      championStillAlive = canReachChampionship(championPick, games, masterBracket);
    }
  }

  // Find Final Four games and count how many picks are still alive
  const finalFourGames = games.filter(g => g.round === 'final_4');
  let finalFourAliveCount = 0;

  for (const game of finalFourGames) {
    const userPick = picks.get(game.id);
    if (userPick) {
      if (!isTeamEliminated(userPick, games, masterBracket)) {
        finalFourAliveCount++;
      }
    }
  }

  return {
    bracket_id: bracketId,
    championStillAlive,
    finalFourAliveCount,
    status: championStillAlive ? 'alive' : 'eliminated',
  };
}

/**
 * Batch check viability for all brackets
 */
export async function checkAllBracketViabilities(
  brackets: Array<{
    bracket_id: string;
    picks: Map<string, string>;
  }>,
  games: Game[],
  masterBracket: MasterBracketEntry[]
): Promise<Map<string, BracketViability>> {
  const viabilityMap = new Map<string, BracketViability>();

  for (const bracket of brackets) {
    const viability = await checkBracketViability(
      bracket.bracket_id,
      bracket.picks,
      games,
      masterBracket
    );
    viabilityMap.set(bracket.bracket_id, viability);
  }

  return viabilityMap;
}
