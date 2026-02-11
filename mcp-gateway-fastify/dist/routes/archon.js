import { createMcpHttpBridge } from "../mcp/createMcpHttpBridge.js";
import { createArchonServer } from "archon-mcp";
export const archonMcpRoute = async (app) => {
    const bridge = createMcpHttpBridge(createArchonServer);
    // IMPORTANT: do not let Fastify consume the stream before MCP transport sees it.
    app.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => {
        done(null, body);
    });
    app.all("/*", async (req, reply) => {
        reply.hijack();
        await bridge.handle(req.raw, reply.raw, req.body);
    });
};
