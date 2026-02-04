import { Command } from "commander";
import { startServer } from "../server";

export function registerServeCommand(program: Command) {
    program
        .command("serve")
        .description("Start the Archon API server for interactive chat")
        .option("-p, --port <number>", "Port to run on", (v) => parseInt(v), 3000)
        .action((options) => {
            startServer(options.port);
        });
}
