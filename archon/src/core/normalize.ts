import { DesignSpec, Domain, Entity, Service } from "./spec";

export function normalizeSpec(spec: DesignSpec): DesignSpec {
    // Clone to avoid mutating original if needed elsewhere
    const normalized = JSON.parse(JSON.stringify(spec)) as DesignSpec;

    // Sort Domains by key
    normalized.domains.sort((a, b) => a.key.localeCompare(b.key));

    for (const d of normalized.domains) {
        // Sort Entities by name
        d.entities.sort((a, b) => a.name.localeCompare(b.name));
        for (const e of d.entities) {
            // Sort Fields by name
            e.fields?.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Sort Services by name
        d.services.sort((a, b) => a.name.localeCompare(b.name));
        for (const s of d.services) {
            // Sort Operations by name
            s.operations?.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    return normalized;
}
