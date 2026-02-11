import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createArchonServer } from "./server.js";
async function main() {
    const server = createArchonServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
