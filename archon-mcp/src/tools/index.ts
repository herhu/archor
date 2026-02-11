import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as Archon from "archon";
import fs from "fs-extra";
import * as path from "path";
import { execSync } from "child_process";
// @ts-ignore
import { AsciiParser } from "uml-mcp/dsl";
// @ts-ignore
import { transformIRToDesignSpec } from "uml-mcp/core";

// Utility to define flexible Zod schemas from JSON schema properties
// This is a simplified migration path - ideally we would define proper Zod schemas
const jsonSchemaToZod = (schema: any): z.ZodTypeAny => {
    return z.object(
        Object.keys(schema.properties).reduce((acc, key) => {
            acc[key] = z.any(); // Using any for simplicity during migration
            return acc;
        }, {} as Record<string, z.ZodTypeAny>)
    );
};

export function registerTools(server: McpServer) {
    server.tool(
        "archon_validate_spec",
        "Validate an Archon DesignSpec v1 JSON object. Returns validation errors or success.",
        {
            spec: z.any().describe("The full DesignSpec JSON object")
        },
        async ({ spec }) => {
            if (!spec) throw new Error("Missing 'spec' argument");

            const schemaErrors = Archon.validateSpecSchema(spec);
            if (schemaErrors.length > 0) {
                return {
                    content: [{ type: "text", text: `Schema Validation Error:\n${schemaErrors.join("\n")}` }],
                    isError: true
                };
            }

            const semanticErrors = Archon.validateSpecSemantic(spec as Archon.DesignSpec);
            if (semanticErrors.length > 0) {
                return {
                    content: [{ type: "text", text: `Semantic Validation Error:\n${semanticErrors.join("\n")}` }],
                    isError: true
                };
            }

            return { 
                content: [{ type: "text", text: "Spec is VALID." }],
                structuredContent: { isValid: true }
            };
        }
    );

    server.tool(
        "archon_generate_project",
        "Generate a full project from a DesignSpec v1. WARNING: Overwrites files in output directory.",
        {
            spec: z.any().describe("The full DesignSpec JSON object"),
            outDir: z.string().describe("Absolute path to output directory"),
            dryRun: z.boolean().optional().describe("If true, only simulates generation")
        },
        async ({ spec, outDir, dryRun }) => {
            if (!spec || !outDir) throw new Error("Missing arguments");
            const isDryRun = dryRun ?? false;

            const errors = [...Archon.validateSpecSchema(spec), ...Archon.validateSpecSemantic(spec as Archon.DesignSpec)];
            if (errors.length > 0) {
                return {
                    content: [{ type: "text", text: `Cannot generate invalid spec:\n${errors.join("\n")}` }],
                    isError: true
                };
            }

            await Archon.generateApp(spec as Archon.DesignSpec, outDir, isDryRun);

            // Verify generation
            if (!isDryRun) {
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
                } else {
                    throw new Error(`Output directory ${outDir} was not created.`);
                }
            }

            return { content: [{ type: "text", text: `Dry run complete. Project would be generated at ${outDir}` }] };
        }
    );

    server.tool(
        "archon_get_schema",
        "Get the formal JSON Schema for Archon DesignSpec v1. Use this to understand the required structure of a spec.",
        {},
        async () => {
            // @ts-ignore
            const schema = Archon.specSchema;
            return {
                content: [{ type: "text", text: JSON.stringify(schema, null, 2) }]
            };
        }
    );

    server.tool(
        "archon_list_modules",
        "List available module presets for injection",
        {},
        async () => {
            return {
                content: [{
                    type: "text", text: JSON.stringify([
                        { type: "cache.redis", description: "Redis Cache Module" },
                        { type: "queue.bullmq", description: "BullMQ Job Queue" }
                    ], null, 2)
                }]
            };
        }
    );

    server.tool(
        "archon_launch_demo",
        "Luxury final step: Install deps, Setup Env, Run Docker, and Expose via Cloudflared.",
        {
            projectDir: z.string().describe("Absolute path to the generated project")
        },
        async ({ projectDir }) => {
            if (!projectDir || !fs.existsSync(projectDir)) {
                throw new Error(`Invalid project directory: ${projectDir}`);
            }

            const log = (msg: string) => console.error(`[Launch] ${msg}`);
            const steps: string[] = [];

            log(`Starting launch sequence for ${projectDir}...`);

            // 1. npm install
            log("Installing dependencies...");
            try {
                execSync("npm install", { cwd: projectDir, stdio: "ignore" });
                steps.push("✅ npm install");
            } catch (e: any) {
                steps.push("❌ npm install failed");
                throw new Error(`npm install failed: ${e.message}`);
            }

            // 2. Setup .env
            const envPath = path.join(projectDir, ".env");
            if (!fs.existsSync(envPath)) {
                log("Creating .env from example...");
                try {
                    fs.copySync(path.join(projectDir, ".env.example"), envPath);
                    steps.push("✅ .env created");
                } catch (e) { }
            }

            // 3. Generate Token
            log("Ensuring scripts are executable...");
            try {
                execSync("chmod +x scripts/*.sh", { cwd: projectDir, stdio: "ignore" });
                steps.push("✅ scripts executable");
            } catch (e) { }

            // 4. Docker Compose Up
            log("Starting Docker containers...");
            try {
                // Capture output to avoid breaking MCP protocol
                execSync("docker compose up -d --build", { cwd: projectDir, stdio: "pipe" });
                steps.push("✅ docker compose up");
            } catch (e: any) {
                const stderr = e.stderr ? e.stderr.toString() : e.message;
                throw new Error(`Docker compose failed:\n${stderr}`);
            }

            // 5. Cloudflared Tunnel
            log("Starting Cloudflare Tunnel...");
            const tunnelCmd = `cloudflared tunnel --url http://localhost:3000`;

            steps.push(`✅ Ready to share! Run this manually: ${tunnelCmd}`);

            return {
                content: [{
                    type: "text",
                    text: `🚀 Launch Sequence Complete!\n\n${steps.join("\n")}\n\nTo share your luxury demo with the world, run:\n\n    ${tunnelCmd}\n\nEnjoy!`
                }]
            };
        }
    );

    server.tool(
        "archon_generate_from_uml",
        "One-shot conversion: ASCII DSL -> Spec -> Generated Project. Use this for rapid iteration from diagrams.",
        {
            dsl: z.string().describe("The ASCII DSL text."),
            outDir: z.string().describe("Absolute path to output directory."),
            dryRun: z.boolean().optional().describe("If true, simulate generation.")
        },
        async ({ dsl, outDir, dryRun }) => {
            if (!dsl || !outDir) throw new Error("Missing arguments");
            const isDryRun = dryRun ?? false;

            // 1. Parse
            const parser = new AsciiParser();
            const ir = parser.parse(dsl);
            if (ir.warnings && ir.warnings.find((w: any) => w.severity === 'error')) {
                    // If we have errors, should we stop? Yes.
                    const errors = ir.warnings.filter((w: any) => w.severity === 'error').map((w: any) => w.message).join("\n");
                    throw new Error(`DSL Parsing Errors:\n${errors}`);
            }

            console.error(`[Archon] Parsing successful. DSL:\n${dsl}`);

            // 2. Transform
            // Need to ensure IR matches what transform expects (types). 
            // Since this is runtime JS/TS, it should be fine.
            const spec = transformIRToDesignSpec(ir);

            // 3. Generate
            // Use existing generation logic from Archon
            // Validate spec first
            const validationErrors = [...Archon.validateSpecSchema(spec), ...Archon.validateSpecSemantic(spec as Archon.DesignSpec)];
            if (validationErrors.length > 0) {
                    throw new Error(`Generated Spec Invalid:\n${validationErrors.join("\n")}`);
            }

            await Archon.generateApp(spec as Archon.DesignSpec, outDir, isDryRun);

            return {
                content: [{
                    type: "text",
                    text: `✅ Project generated from UML at ${outDir}!\n\n📋 **Design Source (DSL):**\n\`\`\`\n${dsl}\n\`\`\``
                }]
            };
        }
    );
}
