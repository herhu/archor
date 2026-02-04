import { Command } from "commander";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export function registerGenerateCommand(program: Command) {
    program
        .command("generate")
        .description("Generate backend code from spec (Phase 1)")
        .requiredOption("-s, --spec <file>", "Path to spec.json")
        .requiredOption("-o, --output <dir>", "Output directory")
        .option("--force", "Overwrite existing files")
        .action((options) => {
            const specPath = path.resolve(options.spec);
            const outDir = path.resolve(options.output);

            if (!fs.existsSync(specPath)) {
                console.error(`Error: Spec file not found at ${specPath}`);
                process.exit(1);
            }

            console.log(`🚀 Generating backend from ${specPath} into ${outDir}...`);

            // Invoke the Archon generator from the sibling package
            // Assuming we accept shelling out as the robust integration method
            try {
                // 1. Locate Phase 1 generator (archon package)
                // Assuming we are in spec-generator/ and archon/ is a sibling
                const archonBin = path.resolve(process.cwd(), "../archon/bin/archon.ts");

                if (!fs.existsSync(archonBin)) {
                    throw new Error(`Archon Phase 1 CLI not found at ${archonBin}`);
                }

                console.log(`Delegating to Archon Generator at ${archonBin}...`);

                // 2. Build command
                // npx ts-node <bin> generate -s <spec> -o <out> --force?
                const cmd = `npx ts-node "${archonBin}" generate -s "${specPath}" -o "${outDir}" ${options.force ? "--force" : ""}`;

                console.log(`> ${cmd}`);

                // 3. Execute
                execSync(cmd, { stdio: "inherit", cwd: process.cwd() });

                console.log(`\n✅ Successfully generated backend in ${outDir}`);

            } catch (e: any) {
                console.error("Generator failed:", e.message);
                process.exit(1);
            }
        });
}
