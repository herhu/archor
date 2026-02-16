import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbUrl: process.env.DATABASE_URL!,
  keyPepper: process.env.API_KEY_PEPPER!, // random secret
  archonMcpCmd: process.env.ARCHON_MCP_CMD ?? "node",
  // default to relative path assuming execution from package root
  archonMcpArgs: (
    process.env.ARCHON_MCP_ARGS ?? "../archon-mcp/dist/index.js"
  ).split(" "),
  workerCount: Number(process.env.MCP_WORKERS ?? 6),
  sseKeepaliveMs: Number(process.env.SSE_KEEPALIVE_MS ?? 15000),
  // hard safety defaults
  allowExecTools: process.env.ALLOW_EXEC_TOOLS === "true", // default false

  // OIDC / Auth
  baseUrl: process.env.BASE_URL!, // e.g. https://auth.yourdomain.com
  oidc: {
    issuer: process.env.OIDC_ISSUER!,
    clientId: process.env.OIDC_CLIENT_ID!,
    clientSecret: process.env.OIDC_CLIENT_SECRET!,
    redirectPath: process.env.OIDC_REDIRECT_PATH ?? "/auth/callback",
    scopes: (process.env.OIDC_SCOPES ?? "openid profile email").split(" "),
  },
  sessionSecret: process.env.SESSION_SECRET!, // strong random 32+ bytes
  cookieSecure: process.env.COOKIE_SECURE !== "false", // true in prod
};

// Basic validation
const required = [
  "DATABASE_URL",
  "API_KEY_PEPPER",
  "BASE_URL",
  "OIDC_ISSUER",
  "OIDC_CLIENT_ID",
  "OIDC_CLIENT_SECRET",
  "SESSION_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] Missing ${key} environment variable.`);
  }
}
