Assumed: **two subdomains** (`auth.` + `mcp.`) and **TLS terminates on Nginx via certbot**. Here’s the **exact EC2 build/run playbook** (infra + config) to ship Phase 3.

---

## 1) DNS in Route 53 (two A records)

Create:

- `auth.yourdomain.com` → **EC2 Elastic IP**
- `mcp.yourdomain.com` → **same EC2 Elastic IP**

Use an Elastic IP so certs + DNS don’t break on instance restart.

---

## 2) EC2 instance baseline

**Instance:** `t3.large` (2 vCPU / 8GB) to start (worker pool + SSE + Postgres).
**OS:** Ubuntu 22.04 LTS (easiest for certbot + packages).
**Security group (inbound):**

- 22 (SSH) from your IP
- 80 (HTTP) from 0.0.0.0/0
- 443 (HTTPS) from 0.0.0.0/0

Everything else closed.

---

## 3) Install system packages

```bash
sudo apt-get update -y
sudo apt-get install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx git build-essential
```

Node + PM2:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pm2
```

---

## 4) Postgres on-box (internal DB)

### Create DB + user

```bash
sudo -u postgres psql
```

In psql:

```sql
create user archon with password 'CHANGE_THIS_STRONG_PASSWORD';
create database archon owner archon;
\q
```

### Lock Postgres to localhost only (good default)

Edit:

`/etc/postgresql/*/main/postgresql.conf`
Set:

```
listen_addresses = '127.0.0.1'
```

Then restart:

```bash
sudo systemctl restart postgresql
```

---

## 5) Deploy your code + build

Assuming your repo is on GitHub:

```bash
cd /var
sudo mkdir -p /var/app
sudo chown -R $USER:$USER /var/app
cd /var/app

git clone <YOUR_REPO_URL> herhu-archor
cd herhu-archor
```

Build **archon-mcp** (existing stdio MCP backend):

```bash
cd archon-mcp
npm install
npm run build
cd ..
```

Build **archon-mcp-remote** (new Fastify access+gateway):

```bash
cd archon-mcp-remote
npm install
npm run build
cd ..
```

---

## 6) Configure environment (Cognito + API key + session)

Create `/var/app/herhu-archor/archon-mcp-remote/.env`:

```bash
cat > /var/app/herhu-archor/archon-mcp-remote/.env << 'EOF'
NODE_ENV=production
PORT=3000

# Postgres (local)
DATABASE_URL=postgresql://archon:CHANGE_THIS_STRONG_PASSWORD@127.0.0.1:5432/archon

# API key hashing pepper (random secret)
API_KEY_PEPPER=CHANGE_ME_RANDOM_LONG

# Fastify session secret (random secret)
SESSION_SECRET=CHANGE_ME_RANDOM_LONG
COOKIE_SECURE=true

# Base URL for auth service
BASE_URL=https://auth.yourdomain.com

# Cognito issuer: https://cognito-idp.<region>.amazonaws.com/<user_pool_id>
OIDC_ISSUER=https://cognito-idp.<REGION>.amazonaws.com/<USER_POOL_ID>
OIDC_CLIENT_ID=<APP_CLIENT_ID>
OIDC_CLIENT_SECRET=<APP_CLIENT_SECRET>
OIDC_REDIRECT_PATH=/auth/callback
OIDC_SCOPES=openid profile email

# MCP worker pool
MCP_WORKERS=6
ARCHON_MCP_CMD=node
ARCHON_MCP_ARGS=../archon-mcp/dist/index.js

# Safety: do NOT allow exec tools by default
ALLOW_EXEC_TOOLS=false

# SSE
SSE_KEEPALIVE_MS=15000
EOF
```

Generate strong secrets:

```bash
openssl rand -hex 32
```

Use that output for `API_KEY_PEPPER` and `SESSION_SECRET`.

---

## 7) Initialize DB schema

Put your schema SQL (from our plan) into the DB:

```bash
psql "postgresql://archon:CHANGE_THIS_STRONG_PASSWORD@127.0.0.1:5432/archon" \
  -f /var/app/herhu-archor/archon-mcp-remote/src/db/schema.sql
```

---

## 8) Run with PM2 (single process is fine)

From remote package directory:

```bash
cd /var/app/herhu-archor/archon-mcp-remote
pm2 start dist/server.js --name archon-mcp-remote --env production --time -- \
  --dotenv .env
pm2 save
pm2 startup
```

> If your build doesn’t include dotenv loading yet, add it in `server.ts` (common pattern) or use `dotenv-cli`. Easiest: install `dotenv` and call `dotenv.config()` at boot.

---

## 9) Nginx: two subdomains, one backend, SSE-safe

We’ll proxy both subdomains to the same Fastify app on `127.0.0.1:3000`, but keep routing clean.

Create `/etc/nginx/sites-available/archon.conf`:

```nginx
# --- AUTH SUBDOMAIN (OIDC + keys) ---
server {
  listen 80;
  server_name auth.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    proxy_read_timeout 300s;
  }
}

# --- MCP SUBDOMAIN (SSE + JSON-RPC) ---
server {
  listen 80;
  server_name mcp.yourdomain.com;

  # SSE endpoint must disable buffering
  location /mcp/sse {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    proxy_buffering off;
    gzip off;

    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    proxy_read_timeout 300s;
  }
}
```

Enable it:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/archon.conf /etc/nginx/sites-enabled/archon.conf
sudo nginx -t
sudo systemctl restart nginx
```

---

## 10) Certbot TLS for both subdomains

Once DNS resolves to the EC2 IP:

```bash
sudo certbot --nginx -d auth.yourdomain.com -d mcp.yourdomain.com
```

This:

- obtains cert
- edits Nginx for 443
- installs renewal timer

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## 11) Cognito configuration (exact URLs to set)

In Cognito Hosted UI settings:

**Callback URL**

- `https://auth.yourdomain.com/auth/callback`

**Sign-out URL**

- `https://auth.yourdomain.com/`

Issuer stays:

- `https://cognito-idp.<REGION>.amazonaws.com/<USER_POOL_ID>`

---

## 12) CloudWatch logs (PM2 + Nginx + system)

Install CloudWatch agent:

```bash
sudo apt-get install -y amazon-cloudwatch-agent
```

Create `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`:

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ubuntu/.pm2/logs/archon-mcp-remote-out.log",
            "log_group_name": "/archon/remote",
            "log_stream_name": "{instance_id}/pm2-out",
            "timezone": "UTC"
          },
          {
            "file_path": "/home/ubuntu/.pm2/logs/archon-mcp-remote-error.log",
            "log_group_name": "/archon/remote",
            "log_stream_name": "{instance_id}/pm2-err",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/archon/nginx",
            "log_stream_name": "{instance_id}/access",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/archon/nginx",
            "log_stream_name": "{instance_id}/error",
            "timezone": "UTC"
          }
        ]
      }
    }
  }
}
```

Start agent:

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s
```

> Ensure your EC2 instance role has CloudWatch Logs permissions.

---

## 13) Smoke tests

### A) Auth redirect works

```bash
curl -I https://auth.yourdomain.com/auth/login
```

Should 302 to Cognito hosted UI.

### B) Key endpoint requires login

```bash
curl -i https://auth.yourdomain.com/v1/keys
```

Should return 401.

### C) MCP SSE endpoint reachable (will 401 without API key)

```bash
curl -i https://mcp.yourdomain.com/mcp/sse
```

Once you have an API key:

```bash
curl -N \
  -H "Authorization: Bearer sk_live_..." \
  https://mcp.yourdomain.com/mcp/sse
```

---

## 14) Two important production defaults (do this now)

1. **Disable exec tools** (`archon_launch_demo`) unless you _really_ want to sell “remote execution”. Keep:

- `ALLOW_EXEC_TOOLS=false`

2. **Workspace sandboxing** before you allow public `archon_generate_project` writes:

- Force outputs under `/var/app/workspaces/<user>/<job>`
- Reject path traversal / absolute paths
