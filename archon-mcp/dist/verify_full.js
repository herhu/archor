import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema, ListResourcesResultSchema, ListPromptsResultSchema, ReadResourceResultSchema, GetPromptResultSchema } from "@modelcontextprotocol/sdk/types.js";
async function main() {
    console.log("Connecting to Archon MCP...");
    const transport = new StdioClientTransport({
        command: "node",
        args: ["./dist/index.js"]
    });
    const client = new Client({
        name: "ArchonClient",
        version: "1.0.0",
    }, {
        capabilities: {
            roots: { listChanged: true }
        },
    });
    await client.connect(transport);
    console.log("✅ Connected.\n");
    // 1. Tools
    console.log("--- TOOLS ---");
    const tools = await client.request({ method: "tools/list" }, ListToolsResultSchema);
    console.log(`Found ${tools.tools.length} tools.`);
    tools.tools.forEach(t => console.log(`- ${t.name}`));
    // 2. Resources
    console.log("\n--- RESOURCES ---");
    const resources = await client.request({ method: "resources/list" }, ListResourcesResultSchema);
    console.log(`Found ${resources.resources.length} resources.`);
    resources.resources.forEach(r => console.log(`- ${r.name} (${r.uri})`));
    if (resources.resources.length > 0) {
        console.log("Reading first resource...");
        const resContent = await client.request({
            method: "resources/read",
            params: { uri: resources.resources[0].uri }
        }, ReadResourceResultSchema);
        // @ts-ignore
        console.log("Content preview:", resContent.contents[0].text.substring(0, 100) + "...");
    }
    // 3. Prompts
    console.log("\n--- PROMPTS ---");
    const prompts = await client.request({ method: "prompts/list" }, ListPromptsResultSchema);
    console.log(`Found ${prompts.prompts.length} prompts.`);
    prompts.prompts.forEach(p => console.log(`- ${p.name}`));
    if (prompts.prompts.length > 0) {
        console.log("Getting first prompt...");
        const promptContent = await client.request({
            method: "prompts/get",
            params: { name: prompts.prompts[0].name }
        }, GetPromptResultSchema);
        console.log("Prompt messages:", promptContent.messages.length);
    }
    await client.close();
}
main().catch(error => {
    console.error("❌ Verification failed:", error);
});
