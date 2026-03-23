-- One-time migration to backfill Round of 32 games with Round of 64 winners
-- Run this ONCE in your Supabase SQL Editor to populate Round of 32 teams

-- This script finds all completed Round of 64 games and advances their winners
-- to the appropriate Round of 32 games based on game_number logic

DO $$
DECLARE
  r64_game RECORD;
  winner_team_id UUID;
  next_game UUID;
  position TEXT;
BEGIN
  -- Loop through all Round of 64 games
  FOR r64_game IN
    SELECT g.id, g.game_number, g.next_game_id, mb.winning_team_id
    FROM games g
    INNER JOIN master_bracket mb ON g.id = mb.game_id
    WHERE g.round = 'round_64' AND mb.winning_team_id IS NOT NULL
  LOOP
    -- Get the winner and next game
    winner_team_id := r64_game.winning_team_id;
    next_game := r64_game.next_game_id;

    -- Skip if no next game
    IF next_game IS NULL THEN
      CONTINUE;
    END IF;

    -- Determine position: odd game numbers go to team1, even to team2
    IF r64_game.game_number % 2 = 1 THEN
      position := 'team1_id';
    ELSE
      position := 'team2_id';
    END IF;

    -- Update the Round of 32 game with the winner
    IF position = 'team1_id' THEN
      UPDATE games SET team1_id = winner_team_id WHERE id = next_game;
      RAISE NOTICE 'Advanced Game % winner to Game % team1', r64_game.game_number, next_game;
    ELSE
      UPDATE games SET team2_id = winner_team_id WHERE id = next_game;
      RAISE NOTICE 'Advanced Game % winner to Game % team2', r64_game.game_number, next_game;
    END IF;
  END LOOP;

  RAISE NOTICE 'Backfill complete! All Round of 64 winners advanced to Round of 32.';
END $$;
