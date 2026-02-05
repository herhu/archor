import { ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as Archon from "archon";
// Get schema from the library export. 
// Note: We need to ensure 'specSchema' is exported from 'archon' index.
// If Archon.specSchema isn't available, we might need to cast or fix the export.
export function registerResources(server) {
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return {
            resources: [
                {
                    uri: "archon://schema/designspec-v1",
                    name: "DesignSpec v1 Schema",
                    mimeType: "application/json",
                    description: "JSON Schema for Archon DesignSpec v1"
                }
            ]
        };
    });
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        if (uri === "archon://schema/designspec-v1") {
            // @ts-ignore - Assuming specSchema is exported properly now
            const schema = Archon.specSchema;
            return {
                contents: [
                    {
                        uri,
                        mimeType: "application/json",
                        text: JSON.stringify(schema, null, 2)
                    }
                ]
            };
        }
        throw new Error(`Resource not found: ${uri}`);
    });
}
