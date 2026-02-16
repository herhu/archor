import * as path from 'path';
import * as fs from 'fs-extra';
import chalk = require('chalk');
import { loadSpec } from '../core/io';
import { DesignSpec } from '../core/spec';
import { generateApp } from '../core/generator';
import { validateSpecSchema, validateSpecSemantic } from '../core/validator';

export async function generateCommand(options: { spec: string, out?: string, dryRun?: boolean, qa?: boolean, force?: boolean }) {
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

        console.error(chalk.green(`Loaded spec: ${spec.name}`));

        // Default to archon-output if not specified
        const outDir = path.resolve(process.cwd(), options.out || 'archon-output');

        // Check overwrite safety
        if (!options.dryRun && !options.force && fs.existsSync(outDir)) {
            const files = await fs.readdir(outDir);
            if (files.length > 0) {
                console.error(chalk.red(`Output directory is not empty: ${outDir}`));
                console.error(chalk.yellow(`Use --force to overwrite.`));
                process.exit(1);
            }
        }

        await generateApp(spec, outDir, options.dryRun);

        if (options.qa !== false) {
            console.error(chalk.blue(`Running QA Gate...`));
            try {
                const cp = require('child_process');
                // Basic QA: install and build
                cp.execSync('npm install', { cwd: outDir, stdio: 'inherit' });
                cp.execSync('npm run format', { cwd: outDir, stdio: 'inherit' });
                cp.execSync('npm run build', { cwd: outDir, stdio: 'inherit' });
                console.error(chalk.green(`QA Gate Passed!`));
            } catch (e) {
                console.error(chalk.red(`QA Gate Failed!`));
                process.exit(1);
            }
        }

        console.error(chalk.green(options.dryRun ? 'Dry run complete!' : 'Generation complete!'));
    } catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
    }
}
