import Fastify from "fastify";
import { config } from "./config.js";
import { db } from "./db/index.js";
import { registerHealth } from "./routes/health.js";
import { registerKeys } from "./routes/keys.js";
import { registerMe } from "./routes/me.js";
import { registerMcpRoutes } from "./mcp/mcpRoutes.js";
import { buildWorkerPool } from "./mcp/pool.js";
import { registerOidc } from "./auth/oidc.js";

import path from "path";
import { fileURLToPath } from "url";
import fastifyStatic from "@fastify/static";
// config already imported above

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  if (!config.dbUrl) throw new Error("DATABASE_URL is required");
  if (!config.keyPepper) throw new Error("API_KEY_PEPPER is required");

  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  // DB
  await db.connect(config.dbUrl);

  // Static Assets
  app.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
    prefix: "/", // optional: default is '/'
  });

  // MCP pool
  const pool = await buildWorkerPool({
    size: config.workerCount,
    cmd: config.archonMcpCmd,
    args: config.archonMcpArgs,
    allowExecTools: config.allowExecTools,
  });

  app.addHook("onClose", async () => {
    await pool.close();
    await db.close();
  });

  // Authorization (OIDC)
  await registerOidc(app);

  // Routes
  registerHealth(app);
  registerKeys(app);
  registerMe(app); // User info and API Key info
  registerMcpRoutes(app, pool);

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Archon MCP Remote running on port ${config.port}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
