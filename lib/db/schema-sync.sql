-- Sync Logs Table
-- Tracks automated game result synchronization attempts

CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  games_updated INTEGER DEFAULT 0,
  games_skipped INTEGER DEFAULT 0,
  errors JSONB,
  api_used TEXT CHECK (api_used IN ('odds_api', 'espn_fallback', 'manual')),
  request_count INTEGER DEFAULT 0,
  response_time_ms INTEGER
);

-- Index for quick lookups of recent syncs
CREATE INDEX IF NOT EXISTS idx_sync_logs_time ON sync_logs(sync_time DESC);

-- Add source tracking column to master_bracket
ALTER TABLE master_bracket ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT 'manual';
ALTER TABLE master_bracket ADD COLUMN IF NOT EXISTS sync_log_id UUID REFERENCES sync_logs(id);

-- Comment for documentation
COMMENT ON TABLE sync_logs IS 'Logs all automated game result synchronization attempts from external APIs';
COMMENT ON COLUMN master_bracket.updated_by IS 'Source of the update: manual, auto_sync, or admin_override';
COMMENT ON COLUMN master_bracket.sync_log_id IS 'References the sync_logs entry that created this update';
