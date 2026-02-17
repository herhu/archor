create extension if not exists pgcrypto;

create table if not exists users (
    id uuid primary key default gen_random_uuid (),
    email text unique,
    oidc_sub text unique,
    created_at timestamptz not null default now()
);

create table if not exists api_keys (
    id uuid primary key default gen_random_uuid (),
    user_id uuid references users (id) on delete cascade,
    name text not null default 'default',
    prefix text not null,
    key_hash text not null,
    scopes jsonb not null default '["archon:read","archon:write"]'::jsonb,
    status text not null default 'active', -- active|revoked
    created_at timestamptz not null default now(),
    revoked_at timestamptz
);

create index if not exists api_keys_hash_idx on api_keys (key_hash);

create table if not exists usage_events (
    id uuid primary key default gen_random_uuid (),
    api_key_id uuid references api_keys (id) on delete set null,
    tool_name text,
    status text not null, -- ok|error|rate_limited|denied
    duration_ms int,
    created_at timestamptz not null default now()
);

-- Archon Milestone 1: Generations Table
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

CREATE INDEX IF NOT EXISTS idx_generations_user_created ON generations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generations_status ON generations (status);

COMMENT ON TABLE generations IS 'Tracks Archon project generations and their artifacts in S3';

COMMENT ON COLUMN generations.user_id IS 'OIDC subject of the user who triggered the generation';