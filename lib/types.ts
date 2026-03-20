// Type definitions for the application

export type Region = 'East' | 'West' | 'South' | 'Midwest';

export type Round =
  | 'first_four'
  | 'round_64'
  | 'round_32'
  | 'sweet_16'
  | 'elite_8'
  | 'final_4'
  | 'championship';

export interface Team {
  id: string;
  name: string;
  mascot_name: string;
  mascot_image_url: string;
  seed: number;
  region: Region;
  created_at?: string;
}

export interface Game {
  id: string;
  round: Round;
  game_number: number;
  region: Region | null;
  team1_id: string | null;
  team2_id: string | null;
  next_game_id: string | null;
  created_at?: string;
  team1?: Team;
  team2?: Team;
}

export interface UserBracket {
  id: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  is_locked: boolean;
}

export interface BracketPick {
  id: string;
  bracket_id: string;
  game_id: string;
  selected_team_id: string;
  created_at: string;
}

export interface MasterBracketEntry {
  game_id: string;
  winning_team_id: string | null;
  completed_at: string | null;
}

export interface LeaderboardScore {
  bracket_id: string;
  user_name: string;
  total_score: number;
  max_possible_score: number;
  correct_picks_by_round: {
    [round: string]: {
      correct: number;
      total: number;
      points: number;
    };
  };
  updated_at: string;
  is_locked: boolean;
}

export interface BracketWithPicks extends UserBracket {
  picks: BracketPick[];
}

export const ROUND_POINTS: Record<Round, number> = {
  first_four: 1,
  round_64: 1,
  round_32: 2,
  sweet_16: 4,
  elite_8: 8,
  final_4: 16,
  championship: 32,
};

export const ROUND_NAMES: Record<Round, string> = {
  first_four: 'First Four',
  round_64: 'Round of 64',
  round_32: 'Round of 32',
  sweet_16: 'Sweet 16',
  elite_8: 'Elite 8',
  final_4: 'Final Four',
  championship: 'Championship',
};
