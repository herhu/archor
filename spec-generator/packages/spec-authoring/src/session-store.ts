import { promises as fs } from "fs";
import path from "path";
import { SpecSession } from "./types";
import { ArchonError } from "./errors";

export interface SessionStore {
    create(session: SpecSession): Promise<void>;
    get(sessionId: string): Promise<SpecSession>;
    put(session: SpecSession): Promise<void>;
    list(): Promise<string[]>;
}

export class FileSessionStore implements SessionStore {
    constructor(private readonly dir: string) { }

    private filePath(sessionId: string): string {
        return path.join(this.dir, `${sessionId}.json`);
    }

    async create(session: SpecSession): Promise<void> {
        await fs.mkdir(this.dir, { recursive: true });
        const fp = this.filePath(session.sessionId);
        try {
            await fs.access(fp);
            throw new ArchonError(`Session already exists: ${session.sessionId}`, "IO_ERROR");
        } catch {
            // ok - doesn't exist
        }
        await this.atomicWrite(fp, JSON.stringify(session, null, 2));
    }

    async get(sessionId: string): Promise<SpecSession> {
        const fp = this.filePath(sessionId);
        try {
            const raw = await fs.readFile(fp, "utf8");
            return JSON.parse(raw) as SpecSession;
        } catch (e: any) {
            if (e?.code === "ENOENT") {
                throw new ArchonError(`Session not found: ${sessionId}`, "SESSION_NOT_FOUND");
            }
            throw new ArchonError(`Failed reading session: ${e?.message ?? String(e)}`, "IO_ERROR");
        }
    }

    async put(session: SpecSession): Promise<void> {
        await fs.mkdir(this.dir, { recursive: true });
        const fp = this.filePath(session.sessionId);
        await this.atomicWrite(fp, JSON.stringify(session, null, 2));
    }

    async list(): Promise<string[]> {
        await fs.mkdir(this.dir, { recursive: true });
        const entries = await fs.readdir(this.dir);
        return entries
            .filter((f) => f.endsWith(".json"))
            .map((f) => f.replace(/\.json$/, ""));
    }

    private async atomicWrite(targetPath: string, data: string): Promise<void> {
        const tmp = `${targetPath}.tmp.${Date.now()}`;
        try {
            await fs.writeFile(tmp, data, "utf8");
            await fs.rename(tmp, targetPath);
        } catch (e: any) {
            throw new ArchonError(`Atomic write failed: ${e?.message ?? String(e)}`, "IO_ERROR");
        } finally {
            // best effort cleanup
            try {
                await fs.unlink(tmp);
            } catch {
                // ignore
            }
        }
    }
}
