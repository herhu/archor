import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as Archon from "archon";
import fs from "fs-extra";
const TOOLS = [
    {
        name: "archon_validate_spec",
        description: "Validate an Archon DesignSpec v1 JSON object. Returns validation errors or success.",
        inputSchema: {
            type: "object",
            properties: {
                spec: { type: "object", description: "The full DesignSpec JSON object" }
            },
            required: ["spec"]
        }
    },
    {
        name: "archon_generate_project",
        description: "Generate a full project from a DesignSpec v1. WARNING: Overwrites files in output directory.",
        inputSchema: {
            type: "object",
            properties: {
                spec: { type: "object", description: "The full DesignSpec JSON object" },
                outDir: { type: "string", description: "Absolute path to output directory" },
                dryRun: { type: "boolean", description: "If true, only simulates generation" }
            },
            required: ["spec", "outDir"]
        }
    },
    {
        name: "archon_get_schema",
        description: "Get the formal JSON Schema for Archon DesignSpec v1. Use this to understand the required structure of a spec.",
        inputSchema: {
            type: "object",
            properties: {},
        }
    },
    {
        name: "archon_list_modules",
        description: "List available module presets for injection",
        inputSchema: {
            type: "object",
            properties: {},
        }
    }
];
export function registerTools(server) {
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: TOOLS };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            if (name === "archon_validate_spec") {
                const spec = args?.spec;
                if (!spec)
                    throw new Error("Missing 'spec' argument");
                const schemaErrors = Archon.validateSpecSchema(spec);
                if (schemaErrors.length > 0) {
                    return {
                        content: [{ type: "text", text: `Schema Validation Error:\n${schemaErrors.join("\n")}` }],
                        isError: true
                    };
                }
                const semanticErrors = Archon.validateSpecSemantic(spec);
                if (semanticErrors.length > 0) {
                    return {
                        content: [{ type: "text", text: `Semantic Validation Error:\n${semanticErrors.join("\n")}` }],
                        isError: true
                    };
                }
                return { content: [{ type: "text", text: "Spec is VALID." }] };
            }
            if (name === "archon_generate_project") {
                const spec = args?.spec;
                const outDir = args?.outDir;
                const dryRun = args?.dryRun ?? false;
                if (!spec || !outDir)
                    throw new Error("Missing arguments");
                const errors = [...Archon.validateSpecSchema(spec), ...Archon.validateSpecSemantic(spec)];
                if (errors.length > 0) {
                    return {
                        content: [{ type: "text", text: `Cannot generate invalid spec:\n${errors.join("\n")}` }],
                        isError: true
                    };
                }
                await Archon.generateApp(spec, outDir, dryRun);
                // Verify generation
                if (!dryRun) {
                    if (fs.existsSync(outDir)) {
                        const files = fs.readdirSync(outDir);
                        if (files.length === 0) {
                            throw new Error("Generator ran but output directory is empty. Something went wrong.");
                        }
                        return {
                            content: [{
                                    type: "text",
                                    text: `Project generated successfully at ${outDir}\n\nGenerated ${files.length} top-level items:\n${files.join("\n")}`
                                }]
                        };
                    }
                    else {
                        throw new Error(`Output directory ${outDir} was not created.`);
                    }
                }
                return { content: [{ type: "text", text: `Dry run complete. Project would be generated at ${outDir}` }] };
            }
            if (name === "archon_list_modules") {
                return {
                    content: [{
                            type: "text", text: JSON.stringify([
                                { type: "cache.redis", description: "Redis Cache Module" },
                                { type: "queue.bullmq", description: "BullMQ Job Queue" }
                            ], null, 2)
                        }]
                };
            }
            if (name === "archon_get_schema") {
                // @ts-ignore
                const schema = Archon.specSchema;
                return {
                    content: [{ type: "text", text: JSON.stringify(schema, null, 2) }]
                };
            }
            throw new Error(`Unknown tool: ${name}`);
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Tool Execution Error: ${err.message}` }],
                isError: true
            };
        }
    });
}
