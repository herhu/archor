export function newSessionId(prefix = "sess"): string {
    // deterministic enough for dev; you can swap for ULID later
    const rnd = Math.random().toString(16).slice(2, 10);
    const ts = Date.now().toString(36);
    return `${prefix}_${ts}_${rnd}`;
}
