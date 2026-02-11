import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AsciiParser } from "./dsl/ascii.js";
import { validateDiagramIR } from "./validation/index.js";
import { transformIRToDesignSpec } from "./transform/spec.js";
import { DiagramIRSchema } from "./schema/ir.js";

// Initialize parser once (stateless?)
const parser = new AsciiParser();

export function registerTools(server: McpServer) {
    server.tool(
        "uml_parse_ascii",
        "Parse ASCII DSL text into DiagramIR.",
        {
            text: z.string().describe("The ASCII DSL text to parse.")
        },
        async ({ text }) => {
            try {
                const ir = parser.parse(text);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(ir, null, 2)
                        }
                    ]
                };
            } catch (err: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error parsing ASCII DSL: ${err.message}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );

    server.tool(
        "uml_validate_ir",
        "Validate a DiagramIR object.",
        {
            ir: z.any().describe("The DiagramIR JSON object.")
        },
        async ({ ir }) => {
             const result = validateDiagramIR(ir);
             return {
                 content: [
                     {
                         type: "text",
                         text: JSON.stringify(result, null, 2)
                     }
                 ]
             };
        }
    );

    server.tool(
        "uml_ir_to_designspec",
        "Transform DiagramIR into Archon DesignSpec v1.",
        {
            ir: z.any().describe("The DiagramIR JSON object.")
        },
        async ({ ir }) => {
            // Validate first?
            const validation = validateDiagramIR(ir);
            if (!validation.valid) {
                return {
                    content: [{ type: "text", text: `Invalid IR: ${JSON.stringify(validation.errors)}` }],
                    isError: true
                };
            }
            
            try {
                // Re-parse to get typed object via Zod for safety before passing to transform
                const parsedIR = DiagramIRSchema.parse(ir); 
                const spec = transformIRToDesignSpec(parsedIR);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(spec, null, 2)
                        }
                    ]
                };
            } catch (err: any) {
                return {
                     content: [{ type: "text", text: `Transformation Error: ${err.message}` }],
                     isError: true
                };
            }
        }
    );
}
