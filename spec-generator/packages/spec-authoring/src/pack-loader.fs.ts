import { PackLoader } from "./deps";
import { ArchonError } from "./errors";
import { promises as fs } from "fs";
import path from "path";

export class FsPackLoader implements PackLoader {
    constructor(private readonly packsDir: string) { }

    async load(templateId: string): Promise<any> {
        const file = path.join(this.packsDir, `${templateId}.json`);
        try {
            const raw = await fs.readFile(file, "utf8");
            return JSON.parse(raw);
        } catch (e: any) {
            if (e?.code === "ENOENT") {
                throw new ArchonError(`Pack not found: ${templateId} (${file})`, "INVALID_INPUT");
            }
            throw new ArchonError(`Failed loading pack ${templateId}: ${e?.message ?? String(e)}`, "IO_ERROR");
        }
    }
}
