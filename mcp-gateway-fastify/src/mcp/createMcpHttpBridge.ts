import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

type McpServerFactory = () => McpServer;

export function createMcpHttpBridge(createServer: McpServerFactory) {
  const sessions = new Map<string, SSEServerTransport>();

  async function handle(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown) {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    
    // Check for sessionId in query params (standard for MCP POST)
    const sessionId = url.searchParams.get("sessionId");

    if (sessionId && sessions.has(sessionId)) {
      const transport = sessions.get(sessionId)!;
      
      if (req.method === 'POST') {
        const body = Buffer.isBuffer(parsedBody) ? parsedBody.toString("utf-8") : parsedBody;
        await transport.handlePostMessage(req, res, body);
        return;
      } else {
        // Unknown method for existing session? 
        // Could be a weird reconnect?
        // Let's return 400 or allow if it's GET?
        // Usually GET is for NEW session.
      }
    }

    if (req.method === 'GET') {
      // New SSE connection
      const server = createServer();
      
      // We need to determine the endpoint URL that clients should POST to.
      // If request is /mcp/archon/sse, we want them to POST to /mcp/archon/message (or similar)
      // The transport takes `_endpoint` argument which is the URL reported in the `endpoint` event.
      // We can infer it from the current request URL.
      // e.g. /mcp/archon/sse -> /mcp/archon/message
      
      // Simple heuristic: replace trailing 'sse' with 'message', or append '/message' if not present.
      let endpointPath = url.pathname;
      if (endpointPath.endsWith('/sse')) {
        endpointPath = endpointPath.replace(/\/sse$/, '/message');
      } else {
        endpointPath += '/message';
      }

      const transport = new SSEServerTransport(endpointPath, res);
      
      sessions.set(transport.sessionId, transport);

      transport.onclose = () => {
        sessions.delete(transport.sessionId);
      };

      await server.connect(transport);
      
      // Start the transport (sends headers and endpoint event)
      await transport.start();
      return;
    }

    // Fallback
    res.writeHead(404).end("Session not found or invalid request");
  }

  return { handle };
}
