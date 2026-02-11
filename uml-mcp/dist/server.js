import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts/index.js";
export function createUmlServer() {
    const server = new McpServer({
        name: "uml-mcp",
        version: "1.0.0",
    });
    registerTools(server);
    registerPrompts(server);
    return server;
}
