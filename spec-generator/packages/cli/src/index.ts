import { Command } from "commander";
import { registerSpecCommands } from "./commands/spec";
import { registerValidateCommand } from "./commands/validate";
import { registerGenerateCommand } from "./commands/generate";

const program = new Command();

program
    .name("archon")
    .description("Archon compiler: chat -> spec -> runnable backend")
    .version("0.2.0");

registerSpecCommands(program);
registerValidateCommand(program);
registerGenerateCommand(program);

program.parse(process.argv);
