-- Fix: Initialize leaderboard scores for all brackets
-- Run this after creating brackets to populate the leaderboard

-- Create or update leaderboard entries for all existing brackets
INSERT INTO leaderboard_scores (bracket_id, user_name, total_score, max_possible_score, correct_picks_by_round)
SELECT
    ub.id,
    ub.user_name,
    0 as total_score,
    192 as max_possible_score, -- Total possible points (32*1 + 16*2 + 8*4 + 4*8 + 2*16 + 1*32)
    '{}'::jsonb as correct_picks_by_round
FROM user_brackets ub
WHERE NOT EXISTS (
    SELECT 1 FROM leaderboard_scores ls WHERE ls.bracket_id = ub.id
);

-- Add trigger to auto-initialize leaderboard when bracket is created
CREATE OR REPLACE FUNCTION initialize_leaderboard_score()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO leaderboard_scores (bracket_id, user_name, total_score, max_possible_score, correct_picks_by_round)
    VALUES (NEW.id, NEW.user_name, 0, 192, '{}'::jsonb);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS init_leaderboard_on_bracket_create ON user_brackets;
CREATE TRIGGER init_leaderboard_on_bracket_create
    AFTER INSERT ON user_brackets
    FOR EACH ROW
    EXECUTE FUNCTION initialize_leaderboard_score();
