import Fastify from "fastify";
import { archonMcpRoute } from "./routes/archon.js";
import { umlMcpRoute } from "./routes/uml.js";
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
async function main() {
    const app = Fastify({ logger: { level: LOG_LEVEL } });
    app.get("/health", async () => ({ ok: true }));
    // Mount each MCP server on its own route:
    await app.register(archonMcpRoute, { prefix: "/mcp/archon" });
    await app.register(umlMcpRoute, { prefix: "/mcp/uml" });
    // Note: /mcp/all is not implemented yet as per plan instructions (optional)
    console.log(`Starting MCP Gateway on ${HOST}:${PORT}`);
    await app.listen({ port: PORT, host: HOST });
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
