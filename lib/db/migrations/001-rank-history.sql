-- Leaderboard History Table
-- Tracks historical snapshots of leaderboard standings for rank change tracking

CREATE TABLE IF NOT EXISTS leaderboard_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bracket_id UUID NOT NULL REFERENCES user_brackets(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rank INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    max_possible_score INTEGER NOT NULL,
    round TEXT NOT NULL CHECK (round IN ('round_64', 'round_32', 'sweet_16', 'elite_8', 'final_4', 'championship', 'tournament_end')),
    snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    games_completed_count INTEGER DEFAULT 0,
    correct_picks_by_round JSONB DEFAULT '{}'::jsonb
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_bracket ON leaderboard_history(bracket_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_round ON leaderboard_history(round);
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_time ON leaderboard_history(snapshot_time DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_composite ON leaderboard_history(bracket_id, round, snapshot_time DESC);

-- Function to snapshot current leaderboard state for a given round
CREATE OR REPLACE FUNCTION snapshot_leaderboard_for_round(p_round TEXT)
RETURNS void AS $$
DECLARE
    v_games_completed INTEGER;
BEGIN
    -- Count games completed so far
    SELECT COUNT(*) INTO v_games_completed
    FROM master_bracket
    WHERE winning_team_id IS NOT NULL;

    -- Insert snapshot of current leaderboard
    INSERT INTO leaderboard_history (
        bracket_id,
        user_name,
        rank,
        total_score,
        max_possible_score,
        round,
        games_completed_count,
        correct_picks_by_round,
        snapshot_time
    )
    SELECT
        bracket_id,
        user_name,
        ROW_NUMBER() OVER (ORDER BY total_score DESC, max_possible_score DESC) as rank,
        total_score,
        max_possible_score,
        p_round,
        v_games_completed,
        correct_picks_by_round,
        NOW()
    FROM leaderboard_scores
    ORDER BY total_score DESC, max_possible_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get the most recent snapshot
CREATE OR REPLACE FUNCTION get_latest_snapshot()
RETURNS TABLE (
    bracket_id UUID,
    user_name TEXT,
    rank INTEGER,
    total_score INTEGER,
    max_possible_score INTEGER,
    round TEXT,
    snapshot_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (lh.bracket_id)
        lh.bracket_id,
        lh.user_name,
        lh.rank,
        lh.total_score,
        lh.max_possible_score,
        lh.round,
        lh.snapshot_time
    FROM leaderboard_history lh
    ORDER BY lh.bracket_id, lh.snapshot_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE leaderboard_history IS 'Historical snapshots of leaderboard standings for tracking rank changes over time';
COMMENT ON COLUMN leaderboard_history.round IS 'Tournament round when this snapshot was taken';
COMMENT ON COLUMN leaderboard_history.games_completed_count IS 'Total number of games completed at the time of snapshot';
COMMENT ON FUNCTION snapshot_leaderboard_for_round(TEXT) IS 'Captures current leaderboard state for a specific round';
