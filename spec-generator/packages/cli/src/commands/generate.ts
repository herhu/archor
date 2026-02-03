import { Command } from "commander";

export function registerGenerateCommand(program: Command) {
    program
        .command("generate")
        .description("Generate backend code from spec (Phase 1)")
        .requiredOption("-s, --spec <file>", "Path to spec.json")
        .requiredOption("-o, --output <dir>", "Output directory")
        .action((options) => {
            console.log(`Generating code from ${options.spec} into ${options.output}...`);
            // TODO: Connect to Phase 1 Generator
            console.log("Done (Phase 1 stub).");
        });
}
