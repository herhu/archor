-- Migration: 001_generations_table.sql
-- Create the generations table for Archon Milestone 1

CREATE TABLE IF NOT EXISTS generations (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL, -- OIDC subject
    spec_s3_key TEXT NOT NULL,
    zip_s3_key TEXT NOT NULL,
    status TEXT NOT NULL, -- 'running', 'success', 'error'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- For lifecycle management
    duration_ms INT,
    zip_size_bytes BIGINT,
    spec_size_bytes BIGINT,
    error TEXT,
    meta JSONB
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_generations_user_created ON generations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generations_status ON generations (status);

-- Comments
COMMENT ON TABLE generations IS 'Tracks Archon project generations and their artifacts in S3';

COMMENT ON COLUMN generations.user_id IS 'OIDC subject of the user who triggered the generation';