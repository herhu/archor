import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { db } from "../db/index.js";
import { config } from "../config.js";
import { requireUser } from "../auth/oidc.js";

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}
function randomKey() {
  // 32 bytes -> 64 hex; you can use base32 if you prefer
  return `sk_live_${crypto.randomBytes(32).toString("hex")}`;
}

export function registerKeys(app: FastifyInstance) {
  app.post(
    "/v1/keys",
    { preHandler: requireUser() },
    async (req: any, reply) => {
      const token = randomKey();
      const prefix = token.slice(0, 16);
      const keyHash = sha256Hex(`${config.keyPepper}:${token}`);

      const userId = req.user.id;

      const row = await db.one<{ id: string }>(
        "insert into api_keys(user_id, prefix, key_hash, scopes) values($1,$2,$3,$4) returning id",
        [
          userId,
          prefix,
          keyHash,
          JSON.stringify(["archon:read", "archon:write"]),
        ],
      );

      // Return plaintext key ONCE
      return reply.send({ id: row.id, apiKey: token, prefix });
    },
  );

  app.get(
    "/v1/keys",
    { preHandler: requireUser() },
    async (req: any, reply) => {
      const userId = req.user.id;
      const rows = await db.manyOrNone(
        "select id, name, prefix, scopes, status, created_at, revoked_at from api_keys where user_id=$1 order by created_at desc",
        [userId],
      );
      return reply.send(rows);
    },
  );

  app.delete(
    "/v1/keys/:id",
    { preHandler: requireUser() },
    async (req: any, reply) => {
      const userId = req.user.id;
      const { id } = req.params as any;

      await db.none(
        "update api_keys set status='revoked', revoked_at=now() where id=$1 and user_id=$2",
        [id, userId],
      );
      return reply.send({ ok: true });
    },
  );
}
