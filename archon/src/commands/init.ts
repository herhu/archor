import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

export async function initCommand(name: string) {
    const targetDir = path.resolve(process.cwd(), name);

    if (fs.existsSync(targetDir)) {
        console.error(chalk.red(`Directory ${name} already exists.`));
        process.exit(1);
    }

    await fs.ensureDir(targetDir);
    console.log(chalk.green(`Initialized empty Archon project in ${targetDir}`));

    // Create a default designspec.json
    const defaultSpec = {
        name: name,
        domains: [],
        crossCutting: {
            auth: {
                jwt: {
                    issuer: 'https://issuer.example.com',
                    audience: 'api',
                    jwksUri: 'https://issuer.example.com/.well-known/jwks.json'
                }
            }
        }
    };

    await fs.writeJSON(path.join(targetDir, 'designspec.json'), defaultSpec, { spaces: 2 });
    console.log(chalk.blue(`Created designspec.json`));
}
