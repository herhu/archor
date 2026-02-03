import { UmlRenderer } from "./deps";
import { DesignSpecV1 } from "../../spec/src/designspec-v1";

export class SimpleUmlRenderer implements UmlRenderer {
    async render(args: { spec: any }): Promise<string> {
        const spec = args.spec as DesignSpecV1;
        let txt = ``;

        // ER Diagram
        txt += `%% ER Diagram\n`;
        txt += `erDiagram\n`;
        for (const d of spec.domains) {
            for (const e of d.entities) {
                txt += `  ${e.name} {\n`;
                for (const f of e.fields) {
                    txt += `    ${f.type} ${f.name}\n`;
                }
                txt += `  }\n`;
            }
        }
        txt += `\n`;

        // Quick Sequence / Usage note
        txt += `%% API Surface (Sequence style summary)\n`;
        txt += `sequenceDiagram\n`;
        txt += `  participant Client\n`;
        txt += `  participant API\n`;
        for (const d of spec.domains) {
            for (const s of d.services) {
                // Just show custom ops to keep it brief
                if (s.operations) {
                    for (const op of s.operations) {
                        txt += `  Client->>API: ${op.method} /${s.route}${op.path}\n`;
                    }
                }
            }
        }

        return txt;
    }
}
