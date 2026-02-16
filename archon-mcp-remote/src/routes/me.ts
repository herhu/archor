import { FastifyInstance } from "fastify";
import { authenticateApiKey } from "../auth/apiKey.js";

export function registerMe(app: FastifyInstance) {
    // If logged in via OIDC, return user profile
    // If authenticated via API Key, return key info
    
    app.get("/v1/me", async (req: any, reply) => {
        if (req.session?.user) {
            return reply.send({ type: "user", ...req.session.user });
        }
        
        try {
            const auth = await authenticateApiKey(req);
            return reply.send({ type: "apikey", ...auth });
        } catch (e) {
             return reply.code(401).send({ error: "Unauthorized" });
        }
    });
}
