import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchOddsAPIResults, determineWinner } from '@/lib/external/odds-api-client';
import { fetchESPNResults } from '@/lib/external/espn-api-client';
import { mapTeamNameToId } from '@/lib/external/team-mapper';
import { updateMasterBracketGame } from '@/lib/db/client';
import type { Game } from '@/lib/types';

export const maxDuration = 10; // Hobby plan limit (10 seconds)
export const dynamic = 'force-dynamic'; // Don't cache this endpoint

interface SyncLogEntry {
  sync_time: string;
  status: 'success' | 'partial' | 'failed';
  games_updated: number;
  games_skipped: number;
  errors: any[];
  api_used: string;
  request_count: number;
  response_time_ms: number;
}

/**
 * GET /api/sync-results
 * Syncs game results from external APIs
 * Can be triggered by Vercel Cron or manually
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const errors: any[] = [];
  let gamesUpdated = 0;
  let gamesSkipped = 0;
  let apiUsed = 'none';

  try {
    console.log('[Sync] Starting game results sync...');

    // Step 1: Fetch results from external API
    const oddsApiKey = process.env.ODDS_API_KEY;
    let syncResult;

    if (oddsApiKey) {
      console.log('[Sync] Using The Odds API as primary source');
      syncResult = await fetchOddsAPIResults(oddsApiKey);
      apiUsed = syncResult.apiUsed;

      // Fallback to ESPN if Odds API fails
      if (!syncResult.success) {
        console.warn('[Sync] Odds API failed, falling back to ESPN API');
        errors.push({
          stage: 'odds_api',
          error: syncResult.error,
        });

        syncResult = await fetchESPNResults();
        apiUsed = syncResult.apiUsed;
      }
    } else {
      console.warn('[Sync] No ODDS_API_KEY found, using ESPN API only');
      syncResult = await fetchESPNResults();
      apiUsed = syncResult.apiUsed;
    }

    if (!syncResult.success) {
      console.error('[Sync] All APIs failed');
      errors.push({
        stage: 'all_apis',
        error: syncResult.error,
      });

      return NextResponse.json({
        success: false,
        gamesUpdated: 0,
        gamesSkipped: 0,
        errors,
        apiUsed,
        duration_ms: Date.now() - startTime,
      }, { status: 500 });
    }

    console.log(`[Sync] Fetched ${syncResult.games.length} completed games from ${apiUsed}`);

    // Step 2: Get all games from database that haven't been completed yet
    const { data: allGames, error: gamesError } = await supabaseAdmin
      .from('games')
      .select('*, team1:teams!games_team1_id_fkey(*), team2:teams!games_team2_id_fkey(*)');

    if (gamesError) {
      console.error('[Sync] Error fetching games from database:', gamesError);
      throw gamesError;
    }

    // Get already completed games
    const { data: completedGames, error: completedError } = await supabaseAdmin
      .from('master_bracket')
      .select('game_id');

    if (completedError) {
      console.error('[Sync] Error fetching completed games:', completedError);
      throw completedError;
    }

    const completedGameIds = new Set(completedGames?.map(g => g.game_id) || []);

    // Step 3: Process each external game result
    for (const externalGame of syncResult.games) {
      try {
        // Determine winner
        const winnerName = determineWinner(externalGame.scores);
        if (!winnerName) {
          console.warn(`[Sync] Could not determine winner for game: ${externalGame.home_team} vs ${externalGame.away_team}`);
          gamesSkipped++;
          continue;
        }

        // Map team names to IDs
        const homeTeamId = await mapTeamNameToId(externalGame.home_team);
        const awayTeamId = await mapTeamNameToId(externalGame.away_team);
        const winnerTeamId = await mapTeamNameToId(winnerName);

        if (!homeTeamId || !awayTeamId || !winnerTeamId) {
          console.warn(`[Sync] Could not map teams for game: ${externalGame.home_team} vs ${externalGame.away_team}`);
          errors.push({
            stage: 'team_mapping',
            game: `${externalGame.home_team} vs ${externalGame.away_team}`,
            homeTeamMapped: !!homeTeamId,
            awayTeamMapped: !!awayTeamId,
            winnerMapped: !!winnerTeamId,
          });
          gamesSkipped++;
          continue;
        }

        // Find matching game in database
        const matchingGame = (allGames as Game[])?.find(game => {
          return (
            (game.team1_id === homeTeamId && game.team2_id === awayTeamId) ||
            (game.team1_id === awayTeamId && game.team2_id === homeTeamId)
          );
        });

        if (!matchingGame) {
          console.warn(`[Sync] No matching game found in database for: ${externalGame.home_team} vs ${externalGame.away_team}`);
          gamesSkipped++;
          continue;
        }

        // Skip if already completed
        if (completedGameIds.has(matchingGame.id)) {
          console.log(`[Sync] Game already completed: ${matchingGame.id}`);
          gamesSkipped++;
          continue;
        }

        // Update master_bracket AND advance winner to next round
        try {
          await updateMasterBracketGame(matchingGame.id, winnerTeamId);
        } catch (updateError: any) {
          console.error(`[Sync] Error updating game ${matchingGame.id}:`, updateError);
          errors.push({
            stage: 'database_update',
            game_id: matchingGame.id,
            error: updateError.message,
          });
          continue;
        }

        console.log(`[Sync] Updated game ${matchingGame.id}: ${winnerName} wins`);
        gamesUpdated++;
      } catch (gameError: any) {
        console.error('[Sync] Error processing game:', gameError);
        errors.push({
          stage: 'game_processing',
          game: `${externalGame.home_team} vs ${externalGame.away_team}`,
          error: gameError.message,
        });
      }
    }

    // Step 4: Log sync attempt
    const logEntry: SyncLogEntry = {
      sync_time: new Date().toISOString(),
      status: errors.length > 0 ? (gamesUpdated > 0 ? 'partial' : 'failed') : 'success',
      games_updated: gamesUpdated,
      games_skipped: gamesSkipped,
      errors: errors.length > 0 ? errors : [],
      api_used: apiUsed,
      request_count: 1,
      response_time_ms: Date.now() - startTime,
    };

    const { error: logError } = await supabaseAdmin
      .from('sync_logs')
      .insert(logEntry);

    if (logError) {
      console.error('[Sync] Error logging sync attempt:', logError);
    }

    console.log(`[Sync] Sync complete: ${gamesUpdated} updated, ${gamesSkipped} skipped, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      gamesUpdated,
      gamesSkipped,
      errors: errors.length > 0 ? errors : undefined,
      apiUsed,
      duration_ms: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('[Sync] Fatal error during sync:', error);

    // Log failed attempt
    try {
      await supabaseAdmin
        .from('sync_logs')
        .insert({
          sync_time: new Date().toISOString(),
          status: 'failed',
          games_updated: gamesUpdated,
          games_skipped: gamesSkipped,
          errors: [{ stage: 'fatal', error: error.message }],
          api_used: apiUsed,
          request_count: 1,
          response_time_ms: Date.now() - startTime,
        });
    } catch (logError) {
      console.error('[Sync] Could not log failed sync:', logError);
    }

    return NextResponse.json({
      success: false,
      gamesUpdated,
      gamesSkipped,
      error: error.message,
      apiUsed,
      duration_ms: Date.now() - startTime,
    }, { status: 500 });
  }
}
