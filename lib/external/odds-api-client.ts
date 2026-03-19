/**
 * The Odds API Client
 * Fetches NCAA Men's Basketball tournament game results
 * API Documentation: https://the-odds-api.com/liveapi/guides/v4/
 */

export interface ExternalGameResult {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  completed: boolean;
  scores?: {
    name: string;
    score: string;
  }[];
  last_update?: string;
}

export interface SyncResult {
  success: boolean;
  games: ExternalGameResult[];
  error?: string;
  apiUsed: 'odds_api' | 'espn_fallback';
}

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const SPORT = 'basketball_ncaab'; // NCAA Men's Basketball

/**
 * Fetches completed NCAA tournament games from The Odds API
 * @param apiKey - The Odds API key
 * @returns Array of completed games with scores
 */
export async function fetchOddsAPIResults(apiKey: string): Promise<SyncResult> {
  if (!apiKey) {
    return {
      success: false,
      games: [],
      error: 'Missing ODDS_API_KEY environment variable',
      apiUsed: 'odds_api',
    };
  }

  try {
    // Fetch scores for completed games
    const url = `${ODDS_API_BASE}/sports/${SPORT}/scores/?apiKey=${apiKey}&daysFrom=1`;

    console.log('[Odds API] Fetching results from:', url.replace(apiKey, '***'));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Odds API] Request failed:', response.status, errorText);

      if (response.status === 401) {
        return {
          success: false,
          games: [],
          error: 'Invalid API key',
          apiUsed: 'odds_api',
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          games: [],
          error: 'Rate limit exceeded',
          apiUsed: 'odds_api',
        };
      }

      return {
        success: false,
        games: [],
        error: `API returned status ${response.status}: ${errorText}`,
        apiUsed: 'odds_api',
      };
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('[Odds API] Unexpected response format:', data);
      return {
        success: false,
        games: [],
        error: 'Unexpected API response format',
        apiUsed: 'odds_api',
      };
    }

    // Filter for completed games only
    const completedGames = data.filter((game: any) => game.completed === true);

    console.log(`[Odds API] Found ${completedGames.length} completed games out of ${data.length} total`);

    // Transform to our internal format
    const games: ExternalGameResult[] = completedGames.map((game: any) => ({
      id: game.id,
      sport_key: game.sport_key,
      commence_time: game.commence_time,
      home_team: game.home_team,
      away_team: game.away_team,
      completed: game.completed,
      scores: game.scores || [],
      last_update: game.last_update,
    }));

    return {
      success: true,
      games,
      apiUsed: 'odds_api',
    };
  } catch (error: any) {
    console.error('[Odds API] Fetch error:', error);
    return {
      success: false,
      games: [],
      error: error.message || 'Unknown error fetching from Odds API',
      apiUsed: 'odds_api',
    };
  }
}

/**
 * Determines the winner of a game from scores array
 * @param scores - Array of team scores
 * @returns Name of winning team or null if no clear winner
 */
export function determineWinner(scores?: { name: string; score: string }[]): string | null {
  if (!scores || scores.length !== 2) {
    return null;
  }

  const [team1, team2] = scores;
  const score1 = parseInt(team1.score, 10);
  const score2 = parseInt(team2.score, 10);

  if (isNaN(score1) || isNaN(score2)) {
    return null;
  }

  if (score1 > score2) {
    return team1.name;
  } else if (score2 > score1) {
    return team2.name;
  }

  // Tie - shouldn't happen in NCAA tournament
  return null;
}

/**
 * Validates that the API key has remaining quota
 * The Odds API includes usage info in response headers
 * @param apiKey - The Odds API key
 * @returns Object with usage information
 */
export async function checkOddsAPIQuota(apiKey: string): Promise<{
  success: boolean;
  remaining?: number;
  used?: number;
  error?: string;
}> {
  if (!apiKey) {
    return {
      success: false,
      error: 'Missing API key',
    };
  }

  try {
    // Use a minimal endpoint to check quota
    const url = `${ODDS_API_BASE}/sports/?apiKey=${apiKey}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    // The Odds API returns quota info in headers
    const remaining = response.headers.get('x-requests-remaining');
    const used = response.headers.get('x-requests-used');

    return {
      success: true,
      remaining: remaining ? parseInt(remaining, 10) : undefined,
      used: used ? parseInt(used, 10) : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
