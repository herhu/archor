import crypto from "crypto";
import { db } from "../db/index.js";
import { config } from "../config.js";

export type AuthContext = {
  apiKeyId: string;
  userId: string | null;
  scopes: string[];
};

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function authenticateApiKey(req: any): Promise<AuthContext> {
  let token = "";
  const authHeader = req.headers?.authorization;
  
  if (authHeader && String(authHeader).startsWith("Bearer ")) {
    token = String(authHeader).slice("Bearer ".length).trim();
  } else if (req.query?.apiKey) {
    token = String(req.query.apiKey).trim();
  }

  if (!token) {
    throw Object.assign(new Error("Missing Bearer token or apiKey query param"), { statusCode: 401 });
  }

  if (!token.startsWith("sk_"))
    throw Object.assign(new Error("Invalid key format"), { statusCode: 401 });

  const keyHash = sha256Hex(`${config.keyPepper}:${token}`);

  const row = await db.oneOrNone<{
    id: string;
    user_id: string | null;
    scopes: any;
    status: string;
  }>("select id, user_id, scopes, status from api_keys where key_hash=$1", [
    keyHash,
  ]);

  if (!row || row.status !== "active")
    throw Object.assign(new Error("Invalid or revoked key"), {
      statusCode: 401,
    });

  const scopes = Array.isArray(row.scopes) ? row.scopes.map(String) : [];
  return { apiKeyId: row.id, userId: row.user_id, scopes };
}
