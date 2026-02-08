#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { AsciiParser } from "./dsl/ascii.js";
import { validateDiagramIR } from "./validation/index.js";
import { transformIRToDesignSpec } from "./transform/spec.js";
import { DiagramIRSchema } from "./schema/ir.js";
import { registerPrompts } from "./prompts/index.js";

const server = new Server(
  {
    name: "uml-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {}
    },
  }
);

const parser = new AsciiParser();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "uml_parse_ascii",
        description: "Parse ASCII DSL text into DiagramIR.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The ASCII DSL text to parse."
            }
          },
          required: ["text"]
        }
      },
      {
        name: "uml_validate_ir",
        description: "Validate a DiagramIR object.",
        inputSchema: {
          type: "object",
          properties: {
            ir: {
              type: "object",
              description: "The DiagramIR JSON object."
            }
          },
          required: ["ir"]
        }
      },
      {
        name: "uml_ir_to_designspec",
        description: "Transform DiagramIR into Archon DesignSpec v1.",
        inputSchema: {
          type: "object",
          properties: {
            ir: {
              type: "object",
              description: "The DiagramIR JSON object."
            }
          },
          required: ["ir"]
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "uml_parse_ascii": {
      const text = String(request.params.arguments?.text);
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

    case "uml_validate_ir": {
        const ir = request.params.arguments?.ir;
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

    case "uml_ir_to_designspec": {
        const ir = request.params.arguments?.ir;
        // Validate first?
        const validation = validateDiagramIR(ir);
        if (!validation.valid) {
            return {
                content: [{ type: "text", text: `Invalid IR: ${JSON.stringify(validation.errors)}` }],
                isError: true
            };
        }
        
        // We need to cast or parse strongly, validateDiagramIR checks structure but returns ValidationResult.
        // We can trust it matches the schema mostly, but let's use Zod parse again to be safe if needed,
        // or just cast since we validated.
        // Actually validateDiagramIR uses safeParse internally.
        // Let's just pass it to transform.
        
        try {
            // Re-parse to get typed object if needed, but transform takes 'any' effectively if not careful,
            // but signature says DiagramIR.
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

    default:
      throw new Error("Unknown tool");
  }
});

registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
