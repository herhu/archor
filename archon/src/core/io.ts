import * as fs from 'fs-extra';
import * as path from 'path';

export async function writeArtifact(filePath: string, content: string, dryRun: boolean = false) {
    if (dryRun) {
        console.log(`[DryRun] Would create: ${filePath}`);
        return;
    }
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    console.log(`Created: ${filePath}`);
}

export function loadSpec(filePath: string): any {
    return fs.readJSONSync(filePath);
}
