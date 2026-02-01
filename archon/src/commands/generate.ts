import * as path from 'path';
import chalk = require('chalk');
import { loadSpec } from '../core/io';
import { DesignSpec } from '../core/spec';
import { generateApp } from '../core/generator';
import { validateSpecSchema, validateSpecSemantic } from '../core/validator';

export async function generateCommand(options: { spec: string, dryRun?: boolean }) {
    const specPath = path.resolve(process.cwd(), options.spec);

    try {
        const spec = await loadSpec(specPath) as DesignSpec;

        // Validation
        const schemaErrors = validateSpecSchema(spec);
        if (schemaErrors.length > 0) {
            console.error(chalk.red('Schema Validation Failed:'));
            schemaErrors.forEach(e => console.error(chalk.red(`- ${e}`)));
            process.exit(1);
        }

        const semanticErrors = validateSpecSemantic(spec);
        if (semanticErrors.length > 0) {
            console.error(chalk.red('Semantic Validation Failed:'));
            semanticErrors.forEach(e => console.error(chalk.red(`- ${e}`)));
            process.exit(1);
        }

        console.log(chalk.green(`Loaded spec: ${spec.name}`));

        // Default output directory is the current directory
        const outDir = process.cwd();

        await generateApp(spec, outDir, options.dryRun);

        console.log(chalk.green(options.dryRun ? 'Dry run complete!' : 'Generation complete!'));
    } catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
    }
}
