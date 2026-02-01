#!/usr/bin/env ts-node

import { Command } from 'commander';
import { generateCommand } from '../src/commands/generate';
import { initCommand } from '../src/commands/init';

const program = new Command();

program
    .name('archon')
    .description('System Architect CLI - Generate NestJS backends from DesignSpec')
    .version('1.0.0');

program
    .command('init')
    .description('Initialize a new Archon project')
    .argument('<name>', 'Project name')
    .action(initCommand);

program
    .command('generate')
    .description('Generate code from designspec.json')
    .option('-s, --spec <path>', 'Path to designspec.json', 'designspec.json')
    .option('-o, --out <path>', 'Output directory', 'archon-out')
    .option('-f, --force', 'Overwrite existing files', false)
    .option('--no-qa', 'Skip QA checks')
    .option('-d, --dry-run', 'Run without writing files')
    .action(generateCommand);

program.parse();
