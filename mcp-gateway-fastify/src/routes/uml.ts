import type { FastifyPluginAsync } from "fastify";
import { createMcpHttpBridge } from "../mcp/createMcpHttpBridge.js";
import { createUmlServer } from "uml-mcp";

export const umlMcpRoute: FastifyPluginAsync = async (app) => {
  const bridge = createMcpHttpBridge(createUmlServer);

  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (_req, body, done) => {
      done(null, body);
    },
  );

  app.all("/*", async (req, reply) => {
    reply.hijack();
    await bridge.handle(req.raw, reply.raw, req.body);
  });
};
