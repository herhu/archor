import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadPrompt = (filename: string) => {
    try {
        return readFileSync(join(__dirname, filename), 'utf-8');
    } catch (error) {
        // Fallback for when running in dist without copied assets, try source
        try {
             return readFileSync(join(__dirname, '../../src/prompts', filename), 'utf-8');
        } catch (e) {
            console.error(`Failed to load prompt ${filename}:`, e);
            throw e;
        }
    }
};

const architectContent = loadPrompt('uml_architect.md');

const PROMPTS = {
    "uml_architect": {
        name: "uml_architect",
        description: "System instructions for the UML Architect persona.",
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: architectContent
                }
            }
        ]
    }
};

export function registerPrompts(server: Server) {
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return {
            prompts: Object.values(PROMPTS).map(p => ({
                name: p.name,
                description: p.description
            }))
        };
    });

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const prompt = PROMPTS[request.params.name as keyof typeof PROMPTS];
        if (!prompt) {
            throw new Error(`Prompt not found: ${request.params.name}`);
        }

        return {
            messages: prompt.messages
        };
    });
}
