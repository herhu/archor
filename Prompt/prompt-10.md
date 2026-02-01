Great — here’s a **production-lean JWT verification v1** that’s still simple enough for Phase 1.

Design goals:

* ✅ Real signature verification (no stub)
* ✅ Issuer + audience checks
* ✅ Supports **RS256 via JWKS URI** (common for Auth0/OIDC) **or** **HS256 via shared secret**
* ✅ Minimal dependencies, no Passport required (keep generator deterministic)

---

# 1) Add dependencies (update `package.json.hbs`)

Add `jose`:

```json
"dependencies": {
  ...
  "jose": "^5.9.0"
}
```

---

# 2) Update `.env.example.hbs`

Replace the JWT section with this (supports both modes):

```hbs
# JWT verification
JWT_ISSUER={{jwtIssuer}}
JWT_AUDIENCE={{jwtAudience}}

# Choose ONE verification mode:

# (A) RS256 / OIDC providers (recommended)
JWT_JWKS_URI={{jwtJwksUri}}

# (B) HS256 shared secret (simple internal use)
# JWT_SECRET=supersecret
```

Also ensure your generator feeds `jwtJwksUri` (see section 6).

---

# 3) Add a small JWT config helper

## Template: `src/auth/jwt.config.ts.hbs`

```ts
export type JwtVerifyMode = 'jwks' | 'secret';

export type JwtConfig = {
  issuer: string;
  audience: string;
  mode: JwtVerifyMode;
  jwksUri?: string;
  secret?: string;
};

export function loadJwtConfig(): JwtConfig {
  const issuer = process.env.JWT_ISSUER || '';
  const audience = process.env.JWT_AUDIENCE || '';

  const jwksUri = process.env.JWT_JWKS_URI || '';
  const secret = process.env.JWT_SECRET || '';

  if (!issuer || !audience) {
    throw new Error('JWT_ISSUER and JWT_AUDIENCE must be set');
  }

  if (jwksUri) {
    return { issuer, audience, mode: 'jwks', jwksUri };
  }

  if (secret) {
    return { issuer, audience, mode: 'secret', secret };
  }

  throw new Error('Set either JWT_JWKS_URI (RS256) or JWT_SECRET (HS256)');
}
```

---

# 4) Replace `JwtAuthGuard` with real verification (JOSE)

## Template: `src/auth/jwt.guard.ts.hbs`

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { loadJwtConfig } from './jwt.config';

type AuthUser = {
  sub?: string;
  email?: string;
  roles: string[];
  raw: JWTPayload;
};

function extractBearerToken(req: any): string | null {
  const auth = req.headers?.authorization || req.headers?.Authorization || '';
  const s = String(auth);
  if (!s.startsWith('Bearer ')) return null;
  return s.slice('Bearer '.length).trim();
}

function normalizeRoles(payload: any): string[] {
  // v1: support common role claim patterns
  const candidates = [
    payload?.roles,
    payload?.role,
    payload?.['https://example.com/roles'], // custom namespace example
    payload?.['permissions']
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c.map(String);
    if (typeof c === 'string' && c.length) return [c];
  }
  return [];
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private cfg = loadJwtConfig();

  constructor() {
    if (this.cfg.mode === 'jwks' && this.cfg.jwksUri) {
      this.jwks = createRemoteJWKSet(new URL(this.cfg.jwksUri));
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractBearerToken(req);
    if (!token) throw new UnauthorizedException('Missing Bearer token');

    try {
      const { payload } = await this.verify(token);

      const user: AuthUser = {
        sub: typeof payload.sub === 'string' ? payload.sub : undefined,
        email: typeof (payload as any).email === 'string' ? (payload as any).email : undefined,
        roles: normalizeRoles(payload),
        raw: payload
      };

      req.user = user;
      return true;
    } catch (e: any) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async verify(token: string) {
    if (this.cfg.mode === 'jwks') {
      if (!this.jwks) throw new Error('JWKS not configured');
      return jwtVerify(token, this.jwks, {
        issuer: this.cfg.issuer,
        audience: this.cfg.audience
      });
    }

    // HS256 secret mode
    const secret = new TextEncoder().encode(this.cfg.secret || '');
    return jwtVerify(token, secret, {
      issuer: this.cfg.issuer,
      audience: this.cfg.audience
    });
  }
}
```

This verifies:

* signature
* issuer
* audience
* standard JWT validity (exp/nbf) via `jwtVerify`

---

# 5) Update `auth.module.ts` export list (small)

Your `src/auth/auth.module.ts.hbs` stays mostly the same, but add export for config if you want. Not necessary.

Just make sure you also generate `jwt.config.ts`.

---

# 6) Wire these into your generator

In your app scaffolding generator, add:

### Emit `jwt.config.ts`:

```ts
renderToFile(
  tpl("src/auth/jwt.config.ts.hbs"),
  {},
  path.join(model.outDir, "src/auth/jwt.config.ts")
);
```

### Update `.env.example` rendering values

In `generateAppScaffold`, pass `jwtJwksUri`:

```ts
renderToFile(
  tpl(".env.example.hbs"),
  {
    kebabProjectName,
    jwtIssuer: spec.crossCutting?.auth?.jwt?.issuer ?? "https://issuer.example",
    jwtAudience: spec.crossCutting?.auth?.jwt?.audience ?? "app",
    jwtJwksUri: spec.crossCutting?.auth?.jwt?.jwksUri ?? "https://YOUR-DOMAIN/.well-known/jwks.json"
  },
  path.join(model.outDir, ".env.example")
);
```

### Extend DesignSpec v1 (small, backward compatible)

If you want to store JWKS in spec, add optional property under `crossCutting.auth.jwt`:

```json
"jwksUri": { "type": "string", "minLength": 10, "maxLength": 300 }
```

Optional = won’t break current specs.

---

# 7) How clients will use it (what you tell them)

If they use Auth0 / OIDC:

* set `JWT_ISSUER`
* set `JWT_AUDIENCE`
* set `JWT_JWKS_URI`

If they use internal secret:

* set `JWT_ISSUER`
* set `JWT_AUDIENCE`
* set `JWT_SECRET`

That’s it.

---

