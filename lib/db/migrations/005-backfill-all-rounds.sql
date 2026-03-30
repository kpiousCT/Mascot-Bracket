-- Comprehensive migration to backfill ALL round winners and advance them properly
-- Run this ONCE in your Supabase SQL Editor to fix all advancement issues

-- This script processes each round in order and advances all completed winners
-- to their appropriate next round games

DO $$
DECLARE
  game_record RECORD;
  winner_team_id UUID;
  next_game UUID;
  position TEXT;
  rounds_to_process TEXT[] := ARRAY['round_64', 'round_32', 'sweet_16', 'elite_8', 'final_4'];
  current_round TEXT;
  games_processed INTEGER;
  total_processed INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting comprehensive bracket advancement backfill...';

  -- Process each round in order
  FOREACH current_round IN ARRAY rounds_to_process
  LOOP
    games_processed := 0;
    RAISE NOTICE 'Processing round: %', current_round;

    -- Loop through all completed games in this round
    FOR game_record IN
      SELECT g.id, g.game_number, g.next_game_id, g.round, mb.winning_team_id,
             t.name as winner_name
      FROM games g
      INNER JOIN master_bracket mb ON g.id = mb.game_id
      LEFT JOIN teams t ON mb.winning_team_id = t.id
      WHERE g.round = current_round
        AND mb.winning_team_id IS NOT NULL
      ORDER BY g.game_number
    LOOP
      -- Get the winner and next game
      winner_team_id := game_record.winning_team_id;
      next_game := game_record.next_game_id;

      -- Skip if no next game (final game)
      IF next_game IS NULL THEN
        RAISE NOTICE 'Game % (%) has no next game - likely final game',
                     game_record.game_number, current_round;
        CONTINUE;
      END IF;

      -- Determine position: odd game numbers go to team1, even to team2
      IF game_record.game_number % 2 = 1 THEN
        position := 'team1_id';
      ELSE
        position := 'team2_id';
      END IF;

      -- Update the next round game with the winner
      IF position = 'team1_id' THEN
        UPDATE games SET team1_id = winner_team_id WHERE id = next_game;
        RAISE NOTICE '  ✓ Advanced % Game % winner (%) to next game team1',
                     current_round, game_record.game_number, game_record.winner_name;
      ELSE
        UPDATE games SET team2_id = winner_team_id WHERE id = next_game;
        RAISE NOTICE '  ✓ Advanced % Game % winner (%) to next game team2',
                     current_round, game_record.game_number, game_record.winner_name;
      END IF;

      games_processed := games_processed + 1;
    END LOOP;

    total_processed := total_processed + games_processed;
    RAISE NOTICE 'Completed %: % games processed', current_round, games_processed;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '🏆 BACKFILL COMPLETE! 🏆';
  RAISE NOTICE 'Total games processed: %', total_processed;
  RAISE NOTICE 'All completed winners have been advanced to their next rounds.';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error during backfill: %', SQLERRM;
END $$;