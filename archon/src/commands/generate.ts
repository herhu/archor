import * as path from 'path';
import chalk from 'chalk';
import { loadSpec } from '../core/io';
import { DesignSpec } from '../core/spec';
import { generateApp } from '../core/generator';

export async function generateCommand(options: { spec: string }) {
    const specPath = path.resolve(process.cwd(), options.spec);

    try {
        const spec = loadSpec(specPath) as DesignSpec;
        console.log(chalk.green(`Loaded spec: ${spec.name}`));

        // Default output directory is the current directory
        const outDir = process.cwd();

        await generateApp(spec, outDir);

        console.log(chalk.green('Generation complete!'));
    } catch (error: any) {
        console.error(chalk.red(`Error loading spec from ${specPath}: ${error.message}`));
        process.exit(1);
    }
}
