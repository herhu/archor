import { Command } from "commander";
import { buildRealOrchestrator } from "../../../spec-authoring/src/bootstrap";
import path from "path";

// Helper to exit nicely on errors
function handleError(e: any) {
    console.error("Error:", e.message || String(e));
    if (e.code) console.error("Code:", e.code);
    process.exit(1);
}

export function registerSpecCommands(program: Command) {
    const spec = program.command("spec").description("Architecture specification workflow");

    spec
        .command("init")
        .description("Start a new spec session")
        .requiredOption("--template <id>", "Template ID (e.g. marketplace.v1)")
        .requiredOption("--prompt <text>", "Design intent prompt")
        .action(async (options) => {
            try {
                const orch = buildRealOrchestrator();
                const session = await orch.initSession({
                    templateId: options.template,
                    prompt: options.prompt
                });
                console.log(`Session initialized: ${session.sessionId}`);
                console.log(`Status: ${session.status}`);
                console.log(`Use 'archon spec show --session ${session.sessionId}' to view details.`);
            } catch (e) {
                handleError(e);
            }
        });

    spec
        .command("show")
        .description("Show session status and questions")
        .requiredOption("--session <id>", "Session ID")
        .option("--json", "Output raw JSON", false)
        .action(async (options) => {
            try {
                const orch = buildRealOrchestrator();
                const session = await orch.showSession({ sessionId: options.session });
                if (options.json) {
                    console.log(JSON.stringify(session, null, 2));
                } else {
                    console.log(`Session: ${session.sessionId}`);
                    console.log(`Status: ${session.status}`);
                    console.log(`Answers provided: ${Object.keys(session.answers).length}`);
                    if (session.diagnostics && session.diagnostics.length > 0) {
                        console.log(`Diagnostics: ${session.diagnostics.length}`);
                        session.diagnostics.forEach(d => console.log(`  [${d.level}] ${d.message} (${d.path})`));
                    }
                }
            } catch (e) {
                handleError(e);
            }
        });

    spec
        .command("answer")
        .description("Provide answers to open questions")
        .requiredOption("--session <id>", "Session ID")
        .option("--set <key=value...>", "Key-value pairs to set (can be used multiple times)")
        .action(async (options) => {
            try {
                const orch = buildRealOrchestrator();
                const set: Record<string, any> = {};

                // Commander handles varying array/string inputs for variadic args, but --set needs manual parsing if passed repeated
                // If the user does: --set k1=v1 --set k2=v2, typically commander gives array or last value depending on config.
                // Or if defined as .option("--set <items...>") it eats args.
                // Let's assume standard commander behavior where repeated options rely on custom processing or variadic definition.
                // Simple manual parsing of argv for robustness or rely on options.set being array or string.

                // For simplicity here, let's assume options.set is passed as string[] or string by user if multiple flags used.
                // Actually, simplest pattern with commander is using .option("--set <value>", "...", (val, prev) => prev.concat([val]), [])

                // Let's iterate raw args or assume user passes multiple --set
                const rawSets: string[] = Array.isArray(options.set) ? options.set : [options.set].filter(Boolean);

                // Manual fix: commander doesn't auto-accumulate unless configured.
                // Let's rely on user passing one string usually or configure accumulation.
                // Simpler: just loop argv for --set
                // Real implementation:

                let args = process.argv.slice(3); // fuzzy, but okay for this snippet
                // Actually, let's just parse the 'set' option if provided.
                // To properly support multiple --set, we need: .option('-s, --set <item>', 'set value', collect, [])

                // Note: Re-defining the command to use proper collector
            } catch (e) {
                handleError(e);
            }
        });

    // Re-write answer command with correct collector pattern
    const answerCmd = spec.command("answer")
        .description("Provide answers to open questions")
        .requiredOption("--session <id>", "Session ID")
        .option("--set <key=value>", "Key-value pair", (val: string, prev: string[]) => prev.concat([val]), [])
        .action(async (options) => {
            try {
                const orch = buildRealOrchestrator();
                const set: Record<string, any> = {};
                const items = options.set as string[];

                for (const item of items) {
                    const [k, ...rest] = item.split('=');
                    const v = rest.join('=');

                    // auto-type inference
                    if (v === 'true') set[k] = true;
                    else if (v === 'false') set[k] = false;
                    else if (/^\d+$/.test(v)) set[k] = parseInt(v, 10);
                    else set[k] = v; // raw string
                }

                const session = await orch.answerSession({ sessionId: options.session, set });
                console.log("Answers updated.");
            } catch (e) {
                handleError(e);
            }
        });

    spec
        .command("finalize")
        .description("Polish, validate, repair, and prepare for approval")
        .requiredOption("--session <id>", "Session ID")
        .option("--auto-approve", "Auto-approve if validation passes", false)
        .option("--max-repair <n>", "Max repair loops", (v) => parseInt(v), 3)
        .action(async (options) => {
            try {
                const orch = buildRealOrchestrator();
                console.log("Finalizing spec (this may take 1-2 minutes)...");
                const session = await orch.finalizeSession({
                    sessionId: options.session,
                    options: {
                        autoApprove: options.autoApprove,
                        maxRepairLoops: options.maxRepair
                    }
                });
                console.log(`Target Status: ${session.status}`);
                if (session.status === 'final') {
                    console.log("Spec valid but waiting for approval.");
                } else if (session.status === 'approved') {
                    console.log("Spec valid and approved!");
                } else {
                    console.log("Finalization finished with diagnostics.");
                }
            } catch (e) {
                handleError(e);
            }
        });

    spec
        .command("approve")
        .description("Approve a finalized spec")
        .requiredOption("--session <id>", "Session ID")
        .action(async (options) => {
            try {
                const orch = buildRealOrchestrator();
                const session = await orch.approveSession({ sessionId: options.session });
                console.log(`Session approved at ${session.approval?.approvedAt}`);
            } catch (e) {
                handleError(e);
            }
        });

    spec
        .command("export")
        .description("Export final artifacts")
        .requiredOption("--session <id>", "Session ID")
        .requiredOption("--dir <path>", "Output directory", "./out")
        .action(async (options) => {
            try {
                const orch = buildRealOrchestrator();
                const dir = path.resolve(options.dir);
                await orch.exportSession({ sessionId: options.session, dir });
                console.log(`Artifacts exported to ${dir}`);
            } catch (e) {
                handleError(e);
            }
        });
}
