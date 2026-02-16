import { FastifyInstance } from "fastify";
import { db } from "../db/index.js";

export function registerHealth(app: FastifyInstance) {
  app.get("/health", async (_req, reply) => {
    try {
        await db.one("select 1");
        return reply.send({ status: "ok", db: "connected" });
    } catch (e) {
        return reply.code(500).send({ status: "error", db: "disconnected", error: String(e) });
    }
  });
}
