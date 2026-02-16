import { FastifyInstance } from "fastify";
import { authenticateApiKey } from "../auth/apiKey.js";
import { config } from "../config.js";
import type { JsonRpcRequest } from "./protocol.js";
import { ok, err } from "./protocol.js";

export function registerMcpRoutes(app: FastifyInstance, pool: any) {
  // SSE channel (simple keepalive; you can later stream progress here)
  app.get("/mcp/sse", async (req, reply) => {
    // Auth Check
    await authenticateApiKey(req);

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.flushHeaders?.();

    const timer = setInterval(() => {
      reply.raw.write(`: keepalive\n\n`);
    }, config.sseKeepaliveMs);

    req.raw.on("close", () => clearInterval(timer));

    // Initial hello
    reply.raw.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);

    // keep connection open
    return reply;
  });

  // JSON-RPC endpoint for MCP messages
  app.post("/mcp", async (req, reply) => {
    const auth = await authenticateApiKey(req);
    const body = req.body as JsonRpcRequest;

    if (
      !body ||
      body.jsonrpc !== "2.0" ||
      body.id === undefined ||
      !body.method
    ) {
      return reply.code(400).send(err(null, -32600, "Invalid Request"));
    }

    try {
      const result = await pool.dispatch(
        { scopes: auth.scopes, apiKeyId: auth.apiKeyId },
        body.method,
        body.params,
      );
      return reply.send(ok(body.id, result));
    } catch (e: any) {
      const code =
        e?.statusCode === 403 ? 403 : e?.statusCode === 429 ? 429 : 500;
      return reply
        .code(code)
        .send(err(body.id, code, e?.message ?? "Internal error"));
    }
  });
}
