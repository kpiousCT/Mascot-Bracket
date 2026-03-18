-- Mascot Bracket Database Schema
-- PostgreSQL database for NCAA Tournament bracket application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table: stores all NCAA tournament teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    mascot_name TEXT NOT NULL,
    mascot_image_url TEXT NOT NULL,
    seed INTEGER NOT NULL CHECK (seed >= 1 AND seed <= 16),
    region TEXT NOT NULL CHECK (region IN ('East', 'West', 'South', 'Midwest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table: tournament structure and matchups
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round TEXT NOT NULL CHECK (round IN ('first_four', 'round_64', 'round_32', 'sweet_16', 'elite_8', 'final_4', 'championship')),
    game_number INTEGER NOT NULL,
    region TEXT CHECK (region IN ('East', 'West', 'South', 'Midwest', NULL)),
    team1_id UUID REFERENCES teams(id),
    team2_id UUID REFERENCES teams(id),
    next_game_id UUID REFERENCES games(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(round, game_number)
);

-- User brackets table: stores user information and bracket metadata
CREATE TABLE user_brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_locked BOOLEAN DEFAULT FALSE,
    UNIQUE(user_name)
);

-- Bracket picks table: user's selections for each game
CREATE TABLE bracket_picks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bracket_id UUID NOT NULL REFERENCES user_brackets(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id),
    selected_team_id UUID NOT NULL REFERENCES teams(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bracket_id, game_id)
);

-- Master bracket table: stores actual tournament results
CREATE TABLE master_bracket (
    game_id UUID PRIMARY KEY REFERENCES games(id),
    winning_team_id UUID REFERENCES teams(id),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Leaderboard scores table: precomputed scores for performance
CREATE TABLE leaderboard_scores (
    bracket_id UUID PRIMARY KEY REFERENCES user_brackets(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    total_score INTEGER NOT NULL DEFAULT 0,
    max_possible_score INTEGER NOT NULL DEFAULT 0,
    correct_picks_by_round JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_teams_region ON teams(region);
CREATE INDEX idx_games_round ON games(round);
CREATE INDEX idx_user_brackets_name ON user_brackets(user_name);
CREATE INDEX idx_bracket_picks_bracket ON bracket_picks(bracket_id);
CREATE INDEX idx_bracket_picks_game ON bracket_picks(game_id);
CREATE INDEX idx_bracket_picks_composite ON bracket_picks(bracket_id, game_id);
CREATE INDEX idx_leaderboard_scores_total ON leaderboard_scores(total_score DESC);
CREATE INDEX idx_master_bracket_completed ON master_bracket(completed_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on user_brackets
CREATE TRIGGER update_user_brackets_updated_at
    BEFORE UPDATE ON user_brackets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on leaderboard_scores
CREATE TRIGGER update_leaderboard_scores_updated_at
    BEFORE UPDATE ON leaderboard_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate bracket score
CREATE OR REPLACE FUNCTION calculate_bracket_score(p_bracket_id UUID)
RETURNS TABLE (
    total_score INTEGER,
    max_possible_score INTEGER,
    correct_picks_by_round JSONB
) AS $$
DECLARE
    v_total_score INTEGER := 0;
    v_max_possible INTEGER := 0;
    v_round_scores JSONB := '{}'::jsonb;
    v_round TEXT;
    v_round_points INTEGER;
    v_correct_count INTEGER;
    v_total_count INTEGER;
BEGIN
    -- Point values for each round
    FOR v_round, v_round_points IN
        SELECT * FROM (VALUES
            ('round_64', 1),
            ('round_32', 2),
            ('sweet_16', 4),
            ('elite_8', 8),
            ('final_4', 16),
            ('championship', 32)
        ) AS rounds(round_name, points)
    LOOP
        -- Count correct picks for this round
        SELECT COUNT(*)
        INTO v_correct_count
        FROM bracket_picks bp
        JOIN master_bracket mb ON bp.game_id = mb.game_id
        JOIN games g ON bp.game_id = g.id
        WHERE bp.bracket_id = p_bracket_id
            AND g.round = v_round
            AND bp.selected_team_id = mb.winning_team_id
            AND mb.completed_at IS NOT NULL;

        -- Count total games in this round
        SELECT COUNT(*)
        INTO v_total_count
        FROM bracket_picks bp
        JOIN games g ON bp.game_id = g.id
        WHERE bp.bracket_id = p_bracket_id
            AND g.round = v_round;

        -- Add to total score
        v_total_score := v_total_score + (v_correct_count * v_round_points);

        -- Store round breakdown
        v_round_scores := jsonb_set(
            v_round_scores,
            ARRAY[v_round],
            jsonb_build_object(
                'correct', v_correct_count,
                'total', v_total_count,
                'points', v_correct_count * v_round_points
            )
        );
    END LOOP;

    -- Calculate max possible score (current score + remaining games)
    SELECT
        v_total_score +
        COALESCE(SUM(
            CASE g.round
                WHEN 'round_64' THEN 1
                WHEN 'round_32' THEN 2
                WHEN 'sweet_16' THEN 4
                WHEN 'elite_8' THEN 8
                WHEN 'final_4' THEN 16
                WHEN 'championship' THEN 32
            END
        ), 0)
    INTO v_max_possible
    FROM bracket_picks bp
    JOIN games g ON bp.game_id = g.id
    LEFT JOIN master_bracket mb ON bp.game_id = mb.game_id
    WHERE bp.bracket_id = p_bracket_id
        AND (mb.winning_team_id IS NULL OR mb.completed_at IS NULL);

    RETURN QUERY SELECT v_total_score, v_max_possible, v_round_scores;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate all bracket scores
CREATE OR REPLACE FUNCTION recalculate_all_scores()
RETURNS void AS $$
DECLARE
    v_bracket RECORD;
    v_score RECORD;
BEGIN
    FOR v_bracket IN SELECT id, user_name FROM user_brackets
    LOOP
        SELECT * INTO v_score FROM calculate_bracket_score(v_bracket.id);

        INSERT INTO leaderboard_scores (bracket_id, user_name, total_score, max_possible_score, correct_picks_by_round)
        VALUES (v_bracket.id, v_bracket.user_name, v_score.total_score, v_score.max_possible_score, v_score.correct_picks_by_round)
        ON CONFLICT (bracket_id)
        DO UPDATE SET
            total_score = v_score.total_score,
            max_possible_score = v_score.max_possible_score,
            correct_picks_by_round = v_score.correct_picks_by_round,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate scores when master bracket is updated
CREATE OR REPLACE FUNCTION trigger_score_recalculation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM recalculate_all_scores();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_scores_on_master_update
    AFTER INSERT OR UPDATE ON master_bracket
    FOR EACH ROW
    EXECUTE FUNCTION trigger_score_recalculation();
