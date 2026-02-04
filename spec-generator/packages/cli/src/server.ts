import express from "express";
import cors from "cors";
import { buildRealOrchestrator } from "../../spec-authoring/src/bootstrap";

export function startServer(port: number = 3000) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const orchestrator = buildRealOrchestrator();

    // 1. Init Session
    app.post("/api/init", async (req, res) => {
        try {
            const { prompt, templateId = "product.v1" } = req.body;
            if (!prompt) {
                return res.status(400).json({ error: "Prompt is required" });
            }

            const session = await orchestrator.initSession({
                templateId,
                prompt
            });

            res.json(session);
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    // 2. Get Session Status
    app.get("/api/session/:id", async (req, res) => {
        try {
            const session = await orchestrator.showSession({ sessionId: req.params.id });
            res.json(session);
        } catch (e: any) {
            // Basic 404 check if needed, but orchestrator throws specific errors?
            // Assuming generic error for now
            res.status(500).json({ error: e.message });
        }
    });

    // 3. Submit Answers
    app.post("/api/session/:id/answer", async (req, res) => {
        try {
            const { set } = req.body; // Expects object { key: value }
            const session = await orchestrator.answerSession({
                sessionId: req.params.id,
                set
            });
            res.json(session);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    // 4. Finalize
    app.post("/api/session/:id/finalize", async (req, res) => {
        try {
            const { autoApprove, maxRepair } = req.body;
            const session = await orchestrator.finalizeSession({
                sessionId: req.params.id,
                options: {
                    autoApprove: autoApprove ?? false,
                    maxRepairLoops: maxRepair ?? 3
                }
            });
            res.json(session);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.listen(port, () => {
        console.log(`Archon API server running on http://localhost:${port}`);
    });
}
