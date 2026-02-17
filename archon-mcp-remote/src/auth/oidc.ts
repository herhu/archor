import { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import crypto from "crypto";
import { Issuer, generators } from "openid-client";
import { config } from "../config.js";
import { db } from "../db/index.js";

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
      secure: false, // FORCE FALSE FOR DEBUGGING
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1800000, // 30 mins
      path: "/",
    },
    saveUninitialized: false,
  });

  // Discover OIDC provider or use explicit config
  let issuer: Issuer;
  if (config.oidc.authUrl && config.oidc.tokenUrl && config.oidc.jwksUri) {
      issuer = new Issuer({
          issuer: config.oidc.issuer,
          authorization_endpoint: config.oidc.authUrl,
          token_endpoint: config.oidc.tokenUrl,
          userinfo_endpoint: config.oidc.userInfoUrl,
          jwks_uri: config.oidc.jwksUri,
      });
  } else {
      try {
          issuer = await Issuer.discover(config.oidc.issuer);
      } catch (e) {
          console.warn("Failed to discover OIDC issuer, implementation will fail until fixed: " + e);
          // Dummy issuer fallback
          issuer = new Issuer({ issuer: config.oidc.issuer, authorization_endpoint: "", token_endpoint: "", jwks_uri: "" }); 
      }
  }

  const client = new issuer.Client({
    client_id: config.oidc.clientId,
    client_secret: config.oidc.clientSecret,
    redirect_uris: [`${config.baseUrl}${config.oidc.redirectPath}`],
    response_types: ["code"],
  });

  // Login
  app.get("/auth/login", async (req, reply) => {
    console.log("[DEBUG] /auth/login hit. Config Secure:", config.cookieSecure);
    const verifier = generators.codeVerifier();
    const challenge = sha256Base64Url(verifier);

    const state = generators.state();
    const nonce = generators.nonce();

    req.session.pkceVerifier = verifier;
    req.session.oauthState = state;
    req.session.oauthNonce = nonce;
    
    console.log("[DEBUG] Session set:", { state, nonce });

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
