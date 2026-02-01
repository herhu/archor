import * as path from 'path';
import chalk = require('chalk');
import { loadSpec } from '../core/io';
import { DesignSpec } from '../core/spec';
import { generateApp } from '../core/generator';
import { validateSpecSchema, validateSpecSemantic } from '../core/validator';

export async function generateCommand(options: { spec: string, dryRun?: boolean, qa?: boolean }) {
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

        const outDir = process.cwd();

        await generateApp(spec, outDir, options.dryRun);

        if (options.qa !== false) {
            console.log(chalk.blue(`Running QA Gate...`));
            try {
                const cp = require('child_process');
                // Basic QA: install and build
                cp.execSync('npm install', { cwd: outDir, stdio: 'inherit' });
                cp.execSync('npm run build', { cwd: outDir, stdio: 'inherit' });
                console.log(chalk.green(`QA Gate Passed!`));
            } catch (e) {
                console.error(chalk.red(`QA Gate Failed!`));
                process.exit(1);
            }
        }

        console.log(chalk.green(options.dryRun ? 'Dry run complete!' : 'Generation complete!'));
    } catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
    }
}
