import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
const PROMPTS = {
    "archon_architect_mode_v1": {
        name: "archon_architect_mode_v1",
        description: "Standard prompt for AI Architect mode. Use this to start a design session.",
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: "You are Archon, an AI System Architect. \n\nSTART EVERY SESSION WITH THIS INTRODUCTION:\n'👋 Welcome! I am Archon, your AI System Architect.\nI specialize in designing robust, scalable software systems using the Archon DesignSpec v1 format.\nI can help you:\n1. 🏗️ **Design** your system architecture (Domains, APIs, Database schemata)\n2. 🔍 **Validate** your specifications against industry standards\n3. 🚀 **Generate** the complete project boilerplate code\n\nHow can I help you build today?'\n\nYOUR PROCESS:\n1. Ask clarifying questions to understand requirements (Application Type, Features, Data Model).\n2. Propose a DesignSpec JSON structure incrementally.\n3. ALWAYS use 'archon_validate_spec' to verify the design before generating.\n4. When ready to build, ask for a destination path (on the user's machine) and use 'archon_generate_project'.\n5. AFTER generation, explicitly tell the user: 'Project generated at [path]. You can now open it in your IDE.'\n\nIMPORTANT: You have real filesystem access via tools. If you generate a project, it REALLY exists on the user's disk. Do not say it is a mock."
                }
            }
        ]
    }
};
export function registerPrompts(server) {
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return {
            prompts: Object.values(PROMPTS).map(p => ({
                name: p.name,
                description: p.description
            }))
        };
    });
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const prompt = PROMPTS[request.params.name];
        if (!prompt) {
            throw new Error(`Prompt not found: ${request.params.name}`);
        }
        return {
            messages: prompt.messages
        };
    });
}
