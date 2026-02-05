import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import * as path from "path";
import fs from "fs-extra";
async function main() {
    const testOutDir = path.resolve(process.cwd(), "test_output_gen");
    // Clean up previous run
    if (fs.existsSync(testOutDir)) {
        fs.removeSync(testOutDir);
    }
    console.log("Connecting to Archon MCP to test generation...");
    const transport = new StdioClientTransport({
        command: "node",
        args: ["./dist/index.js"]
    });
    const client = new Client({ name: "GenTestClient", version: "1.0.0" }, { capabilities: { roots: { listChanged: true } } });
    await client.connect(transport);
    // Minimal Valid Spec
    const spec = {
        version: "1.0.0",
        name: "test-gen-project",
        domains: [
            {
                name: "TestDomain",
                key: "test",
                entities: [],
                services: []
            }
        ]
    };
    console.log(`Generating project in ${testOutDir}...`);
    try {
        const result = await client.request({
            method: "tools/call",
            params: {
                name: "archon_generate_project",
                arguments: {
                    spec: spec,
                    outDir: testOutDir
                }
            }
        }, CallToolResultSchema);
        console.log("Tool Result:", JSON.stringify(result, null, 2));
        // Double check files independently
        if (fs.existsSync(testOutDir)) {
            console.log("✅ Directory created.");
            const files = fs.readdirSync(testOutDir);
            console.log("Files found:", files.length);
            if (files.length > 0) {
                console.log("✅ File generation verified.");
            }
            else {
                console.error("❌ Directory is empty!");
            }
        }
        else {
            console.error("❌ Directory was not created!");
        }
    }
    catch (err) {
        console.error("❌ Generation failed:", err);
    }
    await client.close();
    // Cleanup
    if (fs.existsSync(testOutDir)) {
        fs.removeSync(testOutDir);
    }
}
main().catch(console.error);
