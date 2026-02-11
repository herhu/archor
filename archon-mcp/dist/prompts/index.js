import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const loadPrompt = (filename) => {
    try {
        return readFileSync(join(__dirname, filename), 'utf-8');
    }
    catch (error) {
        // Fallback for when running in dist without copied assets, try source
        try {
            return readFileSync(join(__dirname, '../../src/prompts', filename), 'utf-8');
        }
        catch (e) {
            console.error(`Failed to load prompt ${filename}:`, e);
            throw e;
        }
    }
};
const welcomeContent = loadPrompt('welcome.md');
const PROMPTS = {
    "archon_architect_mode_v1": {
        name: "archon_architect_mode_v1",
        description: "Standard prompt for AI Architect mode. Use this to start a design session.",
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: welcomeContent
                }
            }
        ]
    }
};
export function registerPrompts(server) {
    for (const prompt of Object.values(PROMPTS)) {
        server.prompt(prompt.name, prompt.description, async () => ({
            messages: prompt.messages.map(m => ({
                role: m.role,
                content: {
                    type: "text",
                    text: m.content.text
                }
            }))
        }));
    }
}
