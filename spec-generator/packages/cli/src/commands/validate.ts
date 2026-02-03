import { Command } from "commander";
import { compileValidateV1 } from "../../../spec/src/compiler-gate";
import { validateDesignSpecSchema } from "../../../spec/src/ajv";
import * as fs from "fs";

export function registerValidateCommand(program: Command) {
    program
        .command("validate")
        .description("Validate a DesignSpec v1 JSON file")
        .requiredOption("-s, --spec <file>", "Path to spec.json")
        .option("-S, --schema-only", "Run only AJV schema validation (skip semantic)")
        .action(async (options: any) => {
            try {
                const raw = fs.readFileSync(options.spec, "utf8");
                const json = JSON.parse(raw);

                if (options.schemaOnly) {
                    const res = validateDesignSpecSchema(json);
                    if (res.ok) {
                        console.log("Spec is SCHEMA VALID.");
                    } else {
                        console.error("Spec is SCHEMA INVALID.");
                        res.errors?.forEach(e => {
                            console.error(`[AJV] ${e.message} (${e.instancePath || "/"})`);
                        });
                        process.exit(1);
                    }
                } else {
                    const res = compileValidateV1(json);
                    if (res.ok) {
                        console.log("Spec is VALID (Schema + Semantic).");
                    } else {
                        console.error("Spec is INVALID.");
                        res.diagnostics.forEach(d => console.error(`[${d.level}] ${d.message} (${d.path})`));
                        process.exit(1);
                    }
                }
            } catch (e: any) {
                console.error("Error:", e.message);
                process.exit(1);
            }
        });
}
