import { UmlRenderer } from "./deps";
import { DesignSpecV1 } from "../../spec/src/designspec-v1";

export class SimpleUmlRenderer implements UmlRenderer {
    async render(args: { spec: any }): Promise<string> {
        const spec = args.spec as DesignSpecV1;
        let txt = `classDiagram\n`;

        // Entities
        for (const d of spec.domains) {
            for (const e of d.entities) {
                txt += `  class ${e.name} {\n`;
                for (const f of e.fields) {
                    txt += `    +${f.type} ${f.name}\n`;
                }
                txt += `  }\n`;
            }
        }

        // Implicit relationships (naive name matching)
        const allEntities = new Set<string>();
        spec.domains.forEach(d => d.entities.forEach(e => allEntities.add(e.name)));

        for (const d of spec.domains) {
            for (const e of d.entities) {
                for (const f of e.fields) {
                    // if field name looks like "user_id" or "orderId" and we have "User" or "Order" entity
                    // This is heuristic for the mockup
                    if (f.name.endsWith("Id") || f.name.endsWith("_id")) {
                        const base = f.name.replace(/_?id$/i, "");
                        const target = [...allEntities].find(en => en.toLowerCase() === base.toLowerCase());
                        if (target && target !== e.name) {
                            txt += `  ${target} "1" -- "*" ${e.name} : has\n`;
                        }
                    }
                }
            }
        }

        return txt;
    }
}
