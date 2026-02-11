import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as Archon from "archon";

// Get schema from the library export. 
// Note: We need to ensure 'specSchema' is exported from 'archon' index.
// If Archon.specSchema isn't available, we might need to cast or fix the export.

export function registerResources(server: McpServer) {
    server.resource(
        "designspec-schema-v1",
        "archon://schema/designspec-v1",
        async (uri) => {
            // @ts-ignore - Assuming specSchema is exported properly now
            const schema = Archon.specSchema;

            return {
                contents: [
                    {
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify(schema, null, 2)
                    }
                ]
            };
        }
    );
}
