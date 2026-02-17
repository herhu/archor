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
    
    // Announce the POST endpoint (relative path)
    // We attach the apiKey query param if it was present in the GET request so the POST works too
    const apiKeyParam = (req.query as any).apiKey ? `?apiKey=${(req.query as any).apiKey}` : "";
    reply.raw.write(`event: endpoint\ndata: /mcp${apiKeyParam}\n\n`);

    // keep connection open
    return reply;
  });

  // Handler for MCP messages
  const handleMcpMessage = async (req: any, reply: any) => {
    const auth = await authenticateApiKey(req);
    const body = req.body as JsonRpcRequest;

    if (
      !body ||
      body.jsonrpc !== "2.0" ||
      !body.method
    ) {
      console.error("[MCP Error] Invalid Request Body:", JSON.stringify(body));
      return reply.code(400).send(err(null, -32600, "Invalid Request"));
    }

    // Handle notifications (no id)
    if (body.id === undefined) {
        if (body.method === "notifications/initialized") {
            // Client is just saying hello, acknowledge it
            return reply.send({ jsonrpc: "2.0", result: true, id: null });
        }
        // For other notifications, we can just ignore them or log them
        console.log("[MCP Notification]", body.method);
        return reply.send({ jsonrpc: "2.0", result: true, id: null });
    }

    try {
      const result = await pool.dispatch(
        { scopes: auth.scopes, apiKeyId: auth.apiKeyId },
        body.method,
        body.params,
      );
      return reply.send(ok(body.id, result));
    } catch (e: any) {
      console.error("[MCP Error]", e);
      const code =
        e?.statusCode === 403 ? 403 : e?.statusCode === 429 ? 429 : 500;
      return reply
        .code(code)
        .send(err(body.id, code, e?.message ?? "Internal error"));
    }
  };

  // JSON-RPC endpoint for MCP messages
  app.post("/mcp", handleMcpMessage);
  
  // Alias for clients that try to POST to the SSE URL
  app.post("/mcp/sse", handleMcpMessage);
}
