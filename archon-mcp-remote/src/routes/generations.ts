
import { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { s3Service } from "../services/s3.js";
import { generationInterceptor } from "../mcp/interceptor.js";

// Helper to ensure auth
// We assume Fastify is configured with a decorator or strict session handling
// But archon-mcp-remote seems to rely on session cookie for routes, and API Key for MCP.
// We need to check how `req.user` is populated.
// src/server.ts likely registers OIDC plugins.
// For now, we'll assume `req.user` (from @fastify/passport or similar) or `req.session.get('user')`.
// Let's check src/routes/me.ts if it exists to see how they get user.
// Assuming `req.user` is populated by OIDC integration. Since we didn't check that, I'll check `me.ts` first.
// But I will write a standard implementation and then verify.

export async function registerGenerations(app: FastifyInstance, pool: any) {
  
  // List generations
  app.get("/v1/generations", async (req: any, reply) => {
    const user = req.session?.get("user");
    if (!user || !user.sub) {
        return reply.code(401).send({ error: "Unauthorized" });
    }
    
    // Resolve internal User ID from OIDC Subject
    const userRow = await db.oneOrNone<{id: string}>("SELECT id FROM users WHERE oidc_sub = $1", [user.sub]);
    if (!userRow) {
        // User authenticated but not found in our DB (shouldn't happen if auth flow is correct)
        return reply.code(401).send({ error: "User record not found" });
    }
    const userId = userRow.id;

    console.log(`[Generations] Fetching for internal user_id: ${userId} (oidc: ${user.sub})`);

    try {
        const rows = await db.manyOrNone(`
            SELECT id, status, created_at, duration_ms, error, meta 
            FROM generations 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `, [userId]);
        
        return reply.send(rows);
    } catch (err: any) {
        req.log.error(err);
        return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  // Debug: List Tools
  app.get("/v1/debug/mcp/tools", async (req: any, reply) => {
      try {
          const result = await pool.listTools();
          return reply.send(result);
      } catch (err: any) {
          req.log.error(err);
          return reply.code(500).send({ error: err.message });
      }
  });

  // Download ZIP
  app.get("/v1/generations/:id/download", async (req: any, reply) => {
    const user = req.session?.get("user");
    if (!user || !user.sub) {
        return reply.code(401).send({ error: "Unauthorized" });
    }
    
    // Resolve internal User ID
    const userRow = await db.oneOrNone<{id: string}>("SELECT id FROM users WHERE oidc_sub = $1", [user.sub]);
    if (!userRow) {
        return reply.code(401).send({ error: "User record not found" });
    }
    const userId = userRow.id;
    
    const genId = req.params.id;

    try {
        const gen = await db.oneOrNone<{ zip_s3_key: string }>(`
            SELECT zip_s3_key FROM generations WHERE id = $1 AND user_id = $2
        `, [genId, userId]);

        if (!gen) {
            return reply.code(404).send({ error: "Generation not found" });
        }

        const url = await s3Service.getPresignedUrl(gen.zip_s3_key);
        return reply.redirect(url);
    } catch (err: any) {
        req.log.error(err);
        return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  // Download Spec
  app.get("/v1/generations/:id/spec", async (req: any, reply) => {
    const user = req.session?.get("user");
    if (!user || !user.sub) {
        return reply.code(401).send({ error: "Unauthorized" });
    }
    
    // Resolve internal User ID
    const userRow = await db.oneOrNone<{id: string}>("SELECT id FROM users WHERE oidc_sub = $1", [user.sub]);
    if (!userRow) {
        return reply.code(401).send({ error: "User record not found" });
    }
    const userId = userRow.id;

    const genId = req.params.id;

    try {
        const gen = await db.oneOrNone<{ spec_s3_key: string }>(`
            SELECT spec_s3_key FROM generations WHERE id = $1 AND user_id = $2
        `, [genId, userId]);

        if (!gen) {
            return reply.code(404).send({ error: "Generation not found" });
        }

        const url = await s3Service.getPresignedUrl(gen.spec_s3_key);
        return reply.redirect(url);
    } catch (err: any) {
        req.log.error(err);
        return reply.code(500).send({ error: "Internal Server Error" });
    }
  });


  // Generate Diagram (Dashboard Bridge)
  app.post("/v1/generations/diagram", async (req: any, reply) => {
    const user = req.session?.get("user");
    if (!user || !user.sub) {
        return reply.code(401).send({ error: "Unauthorized" });
    }
    
    // Resolve user (optional for this readonly tool, but good practice)
    const userRow = await db.oneOrNone<{id: string}>("SELECT id FROM users WHERE oidc_sub = $1", [user.sub]);
    if (!userRow) return reply.code(401).send({ error: "User record not found" });

    const { spec, type } = req.body;
    if (!spec || !type) {
        return reply.code(400).send({ error: "Missing spec or type" });
    }

    try {
        // Synthesize context for internal dashboard call
        const ctx = { 
            scopes: ["archon:read"], 
            apiKeyId: `dashboard-${userRow.id}` 
        };
        
        req.log.info({ spec, type }, "Dispatching archon_generate_diagram with payload");
        
        const result = await pool.dispatch(ctx, "tools/call", {
            name: "archon_generate_diagram",
            arguments: { spec, type }
        });
        
        // Setup result format to match tool output: { content: [{ type: 'text', text: '...' }] }
        // We can just return the text content directly to the frontend for simplicity, 
        // or return the whole tool result. Let's return the text.
        const text = result.content?.[0]?.text;
        if (!text) throw new Error("No diagram content returned");

        return reply.send({ diagram: text });
    } catch (err: any) {
        req.log.error(err);
        return reply.code(500).send({ error: err.message || "Failed to generate diagram" });
    }
  });

  // Trigger Generation (Dashboard Bridge)
  app.post("/v1/generations", async (req: any, reply) => {
    const user = req.session?.get("user");
    if (!user || !user.sub) {
        return reply.code(401).send({ error: "Unauthorized" });
    }
    
    // Resolve user
    const userRow = await db.oneOrNone<{id: string}>("SELECT id FROM users WHERE oidc_sub = $1", [user.sub]);
    if (!userRow) return reply.code(401).send({ error: "User record not found" });

    const { spec } = req.body;
    if (!spec) {
        return reply.code(400).send({ error: "Missing spec" });
    }

    try {
        const userId = userRow.id;
        const params = {
            name: 'archon_generate_project',
            arguments: { spec }
        };
        const authContext = { 
            scopes: ["archon:write"], 
            apiKeyId: `dashboard-${userId}` 
        };

        const result = await generationInterceptor.handleGenerateProject(
            params, 
            userId, 
            pool, 
            authContext
        );

        return reply.send(result);

    } catch (err: any) {
        req.log.error(err);
        return reply.code(500).send({ error: err.message || "Failed to trigger generation" });
    }
  });
}
