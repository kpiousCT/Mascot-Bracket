import { supabase } from '../supabase/client';
import type {
  Team,
  Game,
  UserBracket,
  BracketPick,
  MasterBracketEntry,
  LeaderboardScore,
  BracketWithPicks,
} from '../types';

// Teams
export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('region', { ascending: true })
    .order('seed', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTeamById(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Games
export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      team1:teams!games_team1_id_fkey(*),
      team2:teams!games_team2_id_fkey(*)
    `)
    .order('game_number', { ascending: true });

  if (error) throw error;

  // Sort by proper round order (round_64 first, championship last)
  const roundOrder = ['round_64', 'round_32', 'sweet_16', 'elite_8', 'final_4', 'championship'];
  const sorted = (data || []).sort((a, b) => {
    const aIndex = roundOrder.indexOf(a.round);
    const bIndex = roundOrder.indexOf(b.round);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.game_number - b.game_number;
  });

  return sorted;
}

export async function getGamesByRound(round: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      team1:teams!games_team1_id_fkey(*),
      team2:teams!games_team2_id_fkey(*)
    `)
    .eq('round', round)
    .order('game_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

// User Brackets
export async function createUserBracket(userName: string): Promise<UserBracket> {
  const { data, error } = await supabase
    .from('user_brackets')
    .insert({ user_name: userName })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserBracketByName(userName: string): Promise<UserBracket | null> {
  const { data, error } = await supabase
    .from('user_brackets')
    .select('*')
    .eq('user_name', userName)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getUserBrackets(): Promise<UserBracket[]> {
  const { data, error } = await supabase
    .from('user_brackets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Bracket Picks
export async function getBracketPicks(bracketId: string): Promise<BracketPick[]> {
  const { data, error } = await supabase
    .from('bracket_picks')
    .select('*')
    .eq('bracket_id', bracketId);

  if (error) throw error;
  return data || [];
}

export async function saveBracketPick(
  bracketId: string,
  gameId: string,
  selectedTeamId: string
): Promise<BracketPick> {
  const { data, error } = await supabase
    .from('bracket_picks')
    .upsert({
      bracket_id: bracketId,
      game_id: gameId,
      selected_team_id: selectedTeamId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveBracketPicks(
  bracketId: string,
  picks: Array<{ game_id: string; selected_team_id: string }>
): Promise<void> {
  const picksWithBracketId = picks.map((pick) => ({
    bracket_id: bracketId,
    game_id: pick.game_id,
    selected_team_id: pick.selected_team_id,
  }));

  const { error } = await supabase
    .from('bracket_picks')
    .upsert(picksWithBracketId);

  if (error) throw error;
}

export async function getBracketWithPicks(bracketId: string): Promise<BracketWithPicks | null> {
  const { data: bracket, error: bracketError } = await supabase
    .from('user_brackets')
    .select('*')
    .eq('id', bracketId)
    .single();

  if (bracketError) throw bracketError;
  if (!bracket) return null;

  const picks = await getBracketPicks(bracketId);

  return {
    ...bracket,
    picks,
  };
}

// Master Bracket (Admin)
export async function getMasterBracket(): Promise<MasterBracketEntry[]> {
  const { data, error } = await supabase
    .from('master_bracket')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function updateMasterBracketGame(
  gameId: string,
  winningTeamId: string
): Promise<void> {
  // Update master bracket with the winner
  const { error: updateError } = await supabase
    .from('master_bracket')
    .upsert({
      game_id: gameId,
      winning_team_id: winningTeamId,
      completed_at: new Date().toISOString(),
    });

  if (updateError) throw updateError;

  // Get the current game to find next_game_id
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('next_game_id, game_number')
    .eq('id', gameId)
    .single();

  if (gameError) throw gameError;

  // If there's a next game, advance the winner
  if (game?.next_game_id) {
    // Determine position: odd game numbers go to team1, even go to team2
    const position = game.game_number % 2 === 1 ? 'team1_id' : 'team2_id';

    const { error: advanceError } = await supabase
      .from('games')
      .update({ [position]: winningTeamId })
      .eq('id', game.next_game_id);

    if (advanceError) throw advanceError;
  }
}

// Leaderboard
export async function getLeaderboard(): Promise<LeaderboardScore[]> {
  const { data, error } = await supabase
    .from('leaderboard_scores')
    .select(`
      *,
      user_brackets!inner(is_locked)
    `)
    .order('total_score', { ascending: false })
    .order('max_possible_score', { ascending: false });

  if (error) throw error;

  // Flatten the response to include is_locked at the top level
  return (data || []).map((item: any) => ({
    ...item,
    is_locked: item.user_brackets?.is_locked || false,
    user_brackets: undefined, // Remove nested object
  }));
}

export async function recalculateScores(): Promise<void> {
  const { error} = await supabase.rpc('recalculate_all_scores');

  if (error) throw error;
}

// Rank History
export async function snapshotLeaderboard(round: string): Promise<void> {
  const { error } = await supabase.rpc('snapshot_leaderboard_for_round', { p_round: round });

  if (error) throw error;
}

export async function getLatestSnapshot(): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_latest_snapshot');

  if (error) throw error;
  return data || [];
}

export async function getLeaderboardHistory(bracketId?: string): Promise<any[]> {
  let query = supabase
    .from('leaderboard_history')
    .select('*')
    .order('snapshot_time', { ascending: false });

  if (bracketId) {
    query = query.eq('bracket_id', bracketId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// Bracket Viability
export async function getAllBracketsWithPicks(): Promise<Array<{
  bracket_id: string;
  user_name: string;
  picks: BracketPick[];
}>> {
  const { data, error } = await supabase
    .from('user_brackets')
    .select(`
      id,
      user_name,
      bracket_picks (*)
    `);

  if (error) throw error;

  return (data || []).map((item: any) => ({
    bracket_id: item.id,
    user_name: item.user_name,
    picks: item.bracket_picks || [],
  }));
}

// Real-time subscriptions
export function subscribeToLeaderboard(
  callback: (payload: any) => void
) {
  return supabase
    .channel('leaderboard_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaderboard_scores',
      },
      callback
    )
    .subscribe();
}

export function subscribeToMasterBracket(
  callback: (payload: any) => void
) {
  return supabase
    .channel('master_bracket_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'master_bracket',
      },
      callback
    )
    .subscribe();
}
