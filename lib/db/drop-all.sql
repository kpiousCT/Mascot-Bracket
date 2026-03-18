-- Drop all tables and functions for clean reset
-- Run this before re-running schema.sql

-- Drop triggers first
DROP TRIGGER IF EXISTS recalculate_scores_on_master_update ON master_bracket;
DROP TRIGGER IF EXISTS update_leaderboard_scores_updated_at ON leaderboard_scores;
DROP TRIGGER IF EXISTS update_user_brackets_updated_at ON user_brackets;

-- Drop functions
DROP FUNCTION IF EXISTS trigger_score_recalculation();
DROP FUNCTION IF EXISTS recalculate_all_scores();
DROP FUNCTION IF EXISTS calculate_bracket_score(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (CASCADE will handle foreign key constraints)
DROP TABLE IF EXISTS leaderboard_scores CASCADE;
DROP TABLE IF EXISTS master_bracket CASCADE;
DROP TABLE IF EXISTS bracket_picks CASCADE;
DROP TABLE IF EXISTS user_brackets CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- You can now run schema.sql fresh
