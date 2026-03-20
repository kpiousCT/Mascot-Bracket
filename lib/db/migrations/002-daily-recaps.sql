-- Daily Recaps Table
-- Stores auto-generated summaries of each day's tournament action

CREATE TABLE IF NOT EXISTS daily_recaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recap_date DATE NOT NULL UNIQUE,
    games_completed_today INTEGER DEFAULT 0,
    total_games_completed INTEGER DEFAULT 0,
    biggest_upset TEXT,
    biggest_upset_seed_diff INTEGER,
    biggest_rank_change JSONB,
    new_eliminations INTEGER DEFAULT 0,
    eliminated_brackets TEXT[],
    summary_text TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient date queries
CREATE INDEX IF NOT EXISTS idx_daily_recaps_date ON daily_recaps(recap_date DESC);

-- Comments for documentation
COMMENT ON TABLE daily_recaps IS 'Auto-generated daily summaries of tournament action including upsets, rank changes, and eliminations';
COMMENT ON COLUMN daily_recaps.biggest_upset IS 'Description of biggest upset (e.g., "15 seed beats 2 seed")';
COMMENT ON COLUMN daily_recaps.biggest_upset_seed_diff IS 'Seed difference of biggest upset';
COMMENT ON COLUMN daily_recaps.biggest_rank_change IS 'JSON object with {user, previous_rank, new_rank, change} for biggest mover';
COMMENT ON COLUMN daily_recaps.eliminated_brackets IS 'Array of user names whose championship picks were eliminated today';
