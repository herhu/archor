import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
async function main() {
    // Point to the built distribution of the server in the SAME package (archon-mcp)
    const transport = new StdioClientTransport({
        command: "node",
        args: ["./dist/index.js"]
    });
    const client = new Client({
        name: "ArchonClient",
        version: "1.0.0",
    }, {
        capabilities: {},
    });
    await client.connect(transport);
    console.log("Connected to MCP Server!");
    const tools = await client.request({ method: "tools/list" }, ListToolsResultSchema);
    console.log("Available Tools:", JSON.stringify(tools, null, 2));
    await client.close();
}
main().catch(console.error);
