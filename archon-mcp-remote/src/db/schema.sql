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