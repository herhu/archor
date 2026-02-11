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
