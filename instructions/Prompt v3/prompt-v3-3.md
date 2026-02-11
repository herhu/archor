Great — OIDC “now” is the right call if `/v1/keys` is the paid-control-plane. Here’s a **Fastify-native OIDC implementation** that works with **Auth0, Cognito, or Keycloak**, and **protects `/v1/keys` behind login** (session cookie), while keeping **MCP calls authenticated by API key**.

This fits your current approach: keep `archon-mcp` stdio as the execution backend, and add a proper control plane in the new Fastify service.

---

## 1) Provider choice (business + EC2 reality)

### If you’re already on AWS and cost-sensitive:

**Cognito** is usually the best default:

- cheap at low/moderate MAU
- managed OIDC, MFA, hosted UI
- fewer moving parts than Keycloak

### If you want fastest dev + best DX:

**Auth0** is the smoothest.

### If you want full control / self-host:

**Keycloak** works, but it’s an extra service to run/patch (unless you already operate it).

**Implementation below is provider-agnostic**: you just change `OIDC_ISSUER`, `OIDC_CLIENT_ID`, etc.

---

## 2) Auth flow we will implement

- **Authorization Code + PKCE**
- **State + nonce**
- Session stored in a **signed/encrypted cookie** (simple; no Redis required initially)
- `/auth/login` → redirects to IdP
- `/auth/callback` → exchanges code, verifies ID token, creates session
- `/auth/logout` → clears session and optionally redirects to IdP logout
- `requireUser()` preHandler protects `/v1/keys` (+ any admin endpoints)

**Important separation:**

- `/v1/keys` uses **OIDC session** (browser/admin UI)
- `/mcp/*` uses **API key** (`Authorization: Bearer sk_live_...`) for ChatGPT/Claude access

---

## 3) Packages to add (archon-mcp-remote)

From inside `archon-mcp-remote/`:

```bash
npm i @fastify/cookie @fastify/session openid-client
```

(You can also use `@fastify/secure-session`, but `@fastify/session` is straightforward.)

---

## 4) Config additions

`src/config.ts` add:

```ts
export const config = {
  // existing...
  baseUrl: process.env.BASE_URL!, // e.g. https://auth.yourdomain.com or https://mcp.yourdomain.com
  oidc: {
    issuer: process.env.OIDC_ISSUER!, // https://xxx/.well-known/openid-configuration (issuer base)
    clientId: process.env.OIDC_CLIENT_ID!,
    clientSecret: process.env.OIDC_CLIENT_SECRET!,
    redirectPath: process.env.OIDC_REDIRECT_PATH ?? "/auth/callback",
    scopes: (process.env.OIDC_SCOPES ?? "openid profile email").split(" "),
  },
  sessionSecret: process.env.SESSION_SECRET!, // strong random 32+ bytes
  cookieSecure: process.env.COOKIE_SECURE !== "false", // true in prod behind TLS
};
```

Environment example:

```bash
BASE_URL=https://auth.yourdomain.com
OIDC_ISSUER=https://your-tenant.auth0.com/
OIDC_CLIENT_ID=...
OIDC_CLIENT_SECRET=...
SESSION_SECRET=...longrandom...
COOKIE_SECURE=true
```

For Cognito/Keycloak, you’ll swap `OIDC_ISSUER`.

---

## 5) Fastify auth plugin (OIDC + session)

Create `src/auth/oidc.ts`:

```ts
import { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import crypto from "crypto";
import { Issuer, generators } from "openid-client";
import { config } from "../config";
import { db } from "../db";

declare module "fastify" {
  interface Session {
    user?: { id: string; email?: string; sub: string };
    pkceVerifier?: string;
    oauthState?: string;
    oauthNonce?: string;
  }
  interface FastifyRequest {
    user?: { id: string; email?: string; sub: string };
  }
}

function sha256Base64Url(input: string) {
  return crypto.createHash("sha256").update(input).digest("base64url");
}

export async function registerOidc(app: FastifyInstance) {
  await app.register(cookie);
  await app.register(session, {
    secret: config.sessionSecret,
    cookie: {
      secure: config.cookieSecure,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
    saveUninitialized: false,
  });

  // Discover OIDC provider
  const issuer = await Issuer.discover(config.oidc.issuer);
  const client = new issuer.Client({
    client_id: config.oidc.clientId,
    client_secret: config.oidc.clientSecret,
    redirect_uris: [`${config.baseUrl}${config.oidc.redirectPath}`],
    response_types: ["code"],
  });

  // Login
  app.get("/auth/login", async (req, reply) => {
    const verifier = generators.codeVerifier();
    const challenge = sha256Base64Url(verifier);

    const state = generators.state();
    const nonce = generators.nonce();

    req.session.pkceVerifier = verifier;
    req.session.oauthState = state;
    req.session.oauthNonce = nonce;

    const authUrl = client.authorizationUrl({
      scope: config.oidc.scopes.join(" "),
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
      nonce,
    });

    return reply.redirect(authUrl);
  });

  // Callback
  app.get(config.oidc.redirectPath, async (req, reply) => {
    const params = client.callbackParams(req.raw);

    const state = req.session.oauthState;
    const nonce = req.session.oauthNonce;
    const verifier = req.session.pkceVerifier;

    if (!state || !nonce || !verifier) {
      return reply.code(400).send({ error: "Missing OIDC session state" });
    }

    const tokenSet = await client.callback(
      `${config.baseUrl}${config.oidc.redirectPath}`,
      params,
      { state, nonce, code_verifier: verifier },
    );

    const claims = tokenSet.claims();
    const sub = String(claims.sub);
    const email =
      typeof (claims as any).email === "string"
        ? (claims as any).email
        : undefined;

    // Upsert user
    const user = await db.one<{ id: string }>(
      `
      insert into users (email, oidc_sub)
      values ($1, $2)
      on conflict (oidc_sub) do update set email = excluded.email
      returning id
      `,
      [email ?? null, sub],
    );

    req.session.user = { id: user.id, email, sub };

    // Clean ephemeral oauth fields
    req.session.pkceVerifier = undefined;
    req.session.oauthState = undefined;
    req.session.oauthNonce = undefined;

    return reply.redirect("/"); // or /dashboard
  });

  // Logout (local)
  app.post("/auth/logout", async (req, reply) => {
    req.session.user = undefined;
    // optionally: redirect to IdP logout endpoint (provider-specific)
    return reply.send({ ok: true });
  });

  // Attach req.user
  app.addHook("preHandler", async (req) => {
    if (req.session.user) req.user = req.session.user;
  });
}

export function requireUser() {
  return async (req: any, reply: any) => {
    if (!req.user) return reply.code(401).send({ error: "Login required" });
  };
}
```

Notes:

- Works behind Nginx with `trustProxy: true` in Fastify server (you already plan that).
- Cookie is `secure` in production.
- State/nonce/PKCE prevents common OAuth attacks.

---

## 6) Protect `/v1/keys` behind login (OIDC)

Update `src/routes/keys.ts` to require OIDC session:

```ts
import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { db } from "../db";
import { config } from "../config";
import { requireUser } from "../auth/oidc";

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}
function randomKey() {
  return `sk_live_${crypto.randomBytes(32).toString("hex")}`;
}

export function registerKeys(app: FastifyInstance) {
  app.post(
    "/v1/keys",
    { preHandler: requireUser() },
    async (req: any, reply) => {
      const token = randomKey();
      const prefix = token.slice(0, 16);
      const keyHash = sha256Hex(`${config.keyPepper}:${token}`);

      const userId = req.user.id;

      const row = await db.one<{ id: string }>(
        "insert into api_keys(user_id, prefix, key_hash, scopes) values($1,$2,$3,$4) returning id",
        [
          userId,
          prefix,
          keyHash,
          JSON.stringify(["archon:read", "archon:write"]),
        ],
      );

      // Return plaintext key ONCE
      return reply.send({ id: row.id, apiKey: token, prefix });
    },
  );

  app.get(
    "/v1/keys",
    { preHandler: requireUser() },
    async (req: any, reply) => {
      const userId = req.user.id;
      const rows = await db.manyOrNone(
        "select id, name, prefix, scopes, status, created_at, revoked_at from api_keys where user_id=$1 order by created_at desc",
        [userId],
      );
      return reply.send(rows);
    },
  );

  app.delete(
    "/v1/keys/:id",
    { preHandler: requireUser() },
    async (req: any, reply) => {
      const userId = req.user.id;
      const { id } = req.params as any;

      await db.none(
        "update api_keys set status='revoked', revoked_at=now() where id=$1 and user_id=$2",
        [id, userId],
      );
      return reply.send({ ok: true });
    },
  );
}
```

Now only authenticated users can manage their own keys.

---

## 7) Wire OIDC into your server

In `src/server.ts`, register OIDC before routes:

```ts
import { registerOidc } from "./auth/oidc";

await registerOidc(app);

registerHealth(app);
registerKeys(app);
registerMe(app);
registerMcpRoutes(app, pool);
```

---

## 8) Nginx adjustments for OIDC cookies + callbacks

Make sure you pass the correct headers (especially `X-Forwarded-Proto`) so your app builds correct redirects:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header Host $host;
```

And for `/auth/*`, normal proxy buffering is fine.

---

## 9) Provider setup quick mapping (what to plug into env)

### Auth0

- `OIDC_ISSUER=https://YOUR_TENANT.auth0.com/`
- Allowed Callback URL: `https://auth.yourdomain.com/auth/callback`
- Allowed Logout URL: `https://auth.yourdomain.com/`

### Keycloak

- `OIDC_ISSUER=https://keycloak.yourdomain.com/realms/YOURREALM`
- Client: confidential, redirect URI set to `/auth/callback`

### Cognito

- Issuer is your user pool domain issuer (region-specific)
- Configure hosted UI + App client (confidential)
- Callback URL: `/auth/callback`

(Exact issuer strings vary by setup; once you have the discovery URL, it “just works” with `Issuer.discover()`.)

---

## 10) Security checklist (do these now)

- `SESSION_SECRET` strong random (32+ bytes)
- Cookies `secure=true` in prod
- `sameSite=lax` (good for OAuth redirects)
- Add CSRF protection if you add state-changing browser POST forms later
- Log redaction: never log `Authorization` headers or session cookies

---

## Next: pick your IdP

Tell me which one you’re choosing **right now**:

- **Cognito** (AWS native)
