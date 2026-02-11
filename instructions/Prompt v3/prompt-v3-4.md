Cognito is a good fit here. Below is the **exact Cognito setup** you need, the **issuer / endpoints / env vars** to plug into your Fastify OIDC code, and the **domain + Nginx layout** that avoids redirect/cookie pain.

---

## 1) Cognito setup (User Pool + Hosted UI)

### Step A — Create a User Pool

AWS Console → Cognito → **Create user pool**

- Sign-in: **email** (recommended)
- MFA: optional (you can add later)

### Step B — Create an App Client

User pool → **App integration** → **App clients** → Create app client

- Client type: **Confidential client** (recommended for server-side code exchange)
- Generate client secret: **Yes**
- Allowed OAuth flows:
  - ✅ **Authorization code grant**

- Allowed OAuth scopes:
  - ✅ `openid`
  - ✅ `email`
  - ✅ `profile`

- (Optional later) custom scopes like `archon.admin`

### Step C — Enable Hosted UI + configure callback/logout

User pool → **App integration** → **Domain**

- Create a Cognito domain (fastest) like: `archon-prod`

User pool → **App integration** → **Hosted UI**

- Callback URL(s):
  - `https://auth.yourdomain.com/auth/callback`

- Sign out URL(s):
  - `https://auth.yourdomain.com/`

> If you don’t want a separate `auth.` subdomain, you can use `https://mcp.yourdomain.com/auth/callback`. But separate subdomain is cleaner.

---

## 2) The OIDC values you must set (Issuer + endpoints)

### Issuer (this is the one your Fastify code needs)

Cognito issuer is:

**`https://cognito-idp.<REGION>.amazonaws.com/<USER_POOL_ID>`**

Example:

- `REGION=us-east-1`
- `USER_POOL_ID=us-east-1_AbCdEf123`

Issuer:

- `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_AbCdEf123`

This is what you put in:

- `OIDC_ISSUER=...`

### Hosted UI base domain (authorize/token/logout endpoints live here)

If you used a Cognito-managed domain `archon-prod`, then:

**`https://archon-prod.auth.<REGION>.amazoncognito.com`**

Endpoints:

- Authorize: `/oauth2/authorize`
- Token: `/oauth2/token`
- Logout: `/logout`

You don’t have to hardcode these if you’re using OIDC discovery, but it’s useful for debugging.

---

## 3) Environment variables for your Fastify OIDC integration

Set these on EC2 (PM2 env or `.env`):

```bash
# App base URL (your server’s public URL)
BASE_URL=https://auth.yourdomain.com

# Cognito OIDC issuer (user pool issuer)
OIDC_ISSUER=https://cognito-idp.<REGION>.amazonaws.com/<USER_POOL_ID>

# Cognito app client
OIDC_CLIENT_ID=<APP_CLIENT_ID>
OIDC_CLIENT_SECRET=<APP_CLIENT_SECRET>

# OIDC callback path implemented by your Fastify server
OIDC_REDIRECT_PATH=/auth/callback

# Standard scopes
OIDC_SCOPES="openid profile email"

# Session cookie signing
SESSION_SECRET=<32+ bytes random>

# prod should be true
COOKIE_SECURE=true
```

Also keep your API key pepper:

```bash
API_KEY_PEPPER=<random secret>
```

---

## 4) Protecting `/v1/keys` behind Cognito login (what happens)

- User hits `https://auth.yourdomain.com/auth/login`
- Redirects to Cognito Hosted UI
- After login, Cognito redirects back to:
  - `https://auth.yourdomain.com/auth/callback`

- Server exchanges `code` → tokens, validates ID token, then sets your session cookie
- Now `/v1/keys` is accessible (session required)

Meanwhile:

- MCP usage (ChatGPT/Claude) continues to use **API keys only**:
  - `Authorization: Bearer sk_live_...`

This separation is ideal: **humans log in**, **tools use API keys**.

---

## 5) Domain + Nginx layout (recommended)

### Recommended DNS

Route 53:

- `auth.yourdomain.com` → EC2 public IP (A record) or ALB
- `mcp.yourdomain.com` → EC2 public IP (A record) or ALB

### Recommended routing

- `auth.yourdomain.com` serves:
  - `/auth/login`, `/auth/callback`, `/v1/keys`, `/v1/me`

- `mcp.yourdomain.com` serves:
  - `/mcp/sse`, `/mcp` (plus health)

You can run **one Fastify app** and use host-based routing in Nginx, or two processes. For v1: one process is fine.

---

## 6) Cognito “custom domain” (optional, later)

If you want Cognito Hosted UI to be `login.yourdomain.com` instead of `*.amazoncognito.com`, Cognito supports a custom domain but it’s more setup:

- Needs ACM cert (often in **us-east-1** depending on configuration)
- Cognito provisions CloudFront behind it

For v1, keep the Cognito-managed domain. Faster and stable.

---

## 7) Two gotchas to avoid

1. **Callback URL mismatch**
   - Cognito is strict. The callback URL must match exactly (scheme/host/path).

2. **Cookies + TLS**
   - In production, set `COOKIE_SECURE=true` and make sure Nginx terminates TLS properly.
   - Also ensure Fastify has `trustProxy: true` so redirects don’t accidentally become `http://`.

---

## Next step

Confirm these two choices and I’ll give you the exact Nginx server blocks + PM2 env wiring:

1. Do you want **two subdomains** (`auth.` and `mcp.`) or **one** (`mcp.` only with `/auth/*` paths)?
2. Will TLS terminate at **Nginx on EC2** (certbot) or do you plan an **ALB** in front later?

- **two subdomains**
- **TLS on Nginx with certbot**
