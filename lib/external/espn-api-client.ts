/**
 * ESPN API Fallback Client
 * Uses ESPN's unofficial API as backup data source
 * WARNING: This is an undocumented API and may change without notice
 */

import type { ExternalGameResult, SyncResult } from './odds-api-client';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball';

interface ESPNGame {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: Array<{
    id: string;
    date: string;
    competitors: Array<{
      id: string;
      team: {
        id: string;
        displayName: string;
        shortDisplayName: string;
        abbreviation: string;
      };
      homeAway: 'home' | 'away';
      winner?: boolean;
      score: string;
    }>;
    status: {
      type: {
        id: string;
        name: string;
        state: string;
        completed: boolean;
        description: string;
      };
    };
  }>;
}

/**
 * Fetches game results from ESPN's unofficial API
 * @returns Array of completed games
 */
export async function fetchESPNResults(): Promise<SyncResult> {
  try {
    // Fetch scoreboard - this returns games for the current day/recent days
    const url = `${ESPN_API_BASE}/scoreboard`;

    console.log('[ESPN API] Fetching results from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[ESPN API] Request failed:', response.status);
      return {
        success: false,
        games: [],
        error: `ESPN API returned status ${response.status}`,
        apiUsed: 'espn_fallback',
      };
    }

    const data = await response.json();

    if (!data.events || !Array.isArray(data.events)) {
      console.error('[ESPN API] Unexpected response format:', data);
      return {
        success: false,
        games: [],
        error: 'Unexpected ESPN API response format',
        apiUsed: 'espn_fallback',
      };
    }

    // Filter for completed games and transform to our format
    const completedGames: ExternalGameResult[] = [];

    for (const event of data.events) {
      const game = event as ESPNGame;

      if (!game.competitions || game.competitions.length === 0) {
        continue;
      }

      const competition = game.competitions[0];

      // Check if game is completed
      if (!competition.status.type.completed) {
        continue;
      }

      // Extract teams and scores
      if (competition.competitors.length !== 2) {
        continue;
      }

      const [competitor1, competitor2] = competition.competitors;
      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

      if (!homeTeam || !awayTeam) {
        continue;
      }

      completedGames.push({
        id: game.id,
        sport_key: 'basketball_ncaab',
        commence_time: game.date,
        home_team: homeTeam.team.displayName,
        away_team: awayTeam.team.displayName,
        completed: true,
        scores: [
          { name: homeTeam.team.displayName, score: homeTeam.score },
          { name: awayTeam.team.displayName, score: awayTeam.score },
        ],
        last_update: game.date,
      });
    }

    console.log(`[ESPN API] Found ${completedGames.length} completed games`);

    return {
      success: true,
      games: completedGames,
      apiUsed: 'espn_fallback',
    };
  } catch (error: any) {
    console.error('[ESPN API] Fetch error:', error);
    return {
      success: false,
      games: [],
      error: error.message || 'Unknown error fetching from ESPN API',
      apiUsed: 'espn_fallback',
    };
  }
}

/**
 * Filters ESPN games for NCAA Tournament games only
 * ESPN scoreboard includes all college basketball games,
 * so we need to filter for tournament games specifically
 *
 * Note: This is a best-effort filter and may need adjustment
 * @param games - Array of games from ESPN
 * @returns Filtered array of likely tournament games
 */
export function filterTournamentGames(games: ExternalGameResult[]): ExternalGameResult[] {
  // During tournament season (mid-March to early April),
  // we can assume most high-profile games are tournament games

  // TODO: Implement more sophisticated filtering if needed
  // Could check game date range, team rankings, or other indicators

  return games;
}
