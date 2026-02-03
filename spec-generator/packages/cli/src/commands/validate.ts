import { Command } from "commander";
import { compileValidateV1 } from "../../../spec/src/compiler-gate";
import fs from "fs";

export function registerValidateCommand(program: Command) {
    program
        .command("validate")
        .description("Validate a DesignSpec v1 JSON file")
        .requiredOption("-s, --spec <file>", "Path to spec.json")
        .action(async (options) => {
            try {
                const raw = fs.readFileSync(options.spec, "utf8");
                const json = JSON.parse(raw);
                const res = compileValidateV1(json);

                if (res.ok) {
                    console.log("Spec is VALID.");
                } else {
                    console.error("Spec is INVALID.");
                    res.diagnostics.forEach(d => console.error(`[${d.level}] ${d.message} (${d.path})`));
                    process.exit(1);
                }
            } catch (e: any) {
                console.error("Error:", e.message);
                process.exit(1);
            }
        });
}
