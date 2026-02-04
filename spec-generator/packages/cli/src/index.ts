import { Command } from "commander";
import { registerSpecCommands } from "./commands/spec";
import { registerValidateCommand } from "./commands/validate";
import { registerGenerateCommand } from "./commands/generate";
import { registerServeCommand } from "./commands/serve";

const program = new Command();

program
    .name("archon")
    .description("Archon compiler: chat -> spec -> runnable backend")
    .version("0.2.0");

registerSpecCommands(program);
registerValidateCommand(program);
registerGenerateCommand(program);
registerServeCommand(program);

program.parse(process.argv);
