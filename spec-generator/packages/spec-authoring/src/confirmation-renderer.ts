import { ConfirmationRenderer } from "./deps";
import { SpecSession } from "./types";
import { DesignSpecV1 } from "../../spec/src/designspec-v1";

export class SimpleConfirmationRenderer implements ConfirmationRenderer {
    async render(args: { session: SpecSession; spec: any }): Promise<string> {
        const spec = args.spec as DesignSpecV1;
        const answers = args.session.answers;

        // Helper to get answer safely
        const a = (key: string) => String(answers[key] ?? "N/A");

        let md = `# Confirmation Pack — ${a("app.name")}\n\n`;

        md += `## What you’re getting\n`;
        md += `A backend API for a marketplace that supports:\n`;
        md += `- Catalog listings (${a("catalog.itemName")})\n`;
        md += `- Browse + search (if enabled)\n`;
        md += `- Cart and checkout\n`;
        md += `- Orders and order status\n`;
        md += `- Optional integrations: payments, email, delivery (based on your choices)\n\n`;
        md += `---\n\n`;

        md += `## Key decisions (your choices)\n`;
        md += `- Auth mode: **${a("auth.mode")}**\n`;
        md += `- Payments provider: **${a("payments.provider")}**\n`;
        md += `- Email provider: **${a("email.provider")}**\n`;
        md += `- Delivery provider: **${a("delivery.provider")}**\n`;
        md += `- Inventory mode: **${a("inventory.mode")}**\n`;
        md += `- Currency: **${a("catalog.currency")}**\n\n`;
        md += `---\n\n`;

        md += `## Data model (entities)\n`;
        for (const d of spec.domains) {
            md += `### Domain: ${d.name} (key: ${d.key})\n`;
            for (const e of d.entities) {
                md += `**${e.name}**\n`;
                for (const f of e.fields) {
                    const extras = [
                        f.nullable ? "(nullable)" : "",
                        f.primary ? "(primary)" : ""
                    ].filter(Boolean).join(" ");
                    md += `- ${f.name} : ${f.type} ${extras}\n`;
                }
                md += `\n`;
            }
        }
        md += `---\n\n`;

        md += `## API surface (endpoints)\n`;
        for (const d of spec.domains) {
            md += `### ${d.key} routes\n`;
            for (const s of d.services) {
                md += `**Base route:** \`/${s.route}\`\n`;
                md += `CRUD: ${s.crud.join(", ")}\n\n`;

                if (s.operations && s.operations.length > 0) {
                    md += `Custom operations:\n`;
                    for (const op of s.operations) {
                        const isProtected = "scopesAll" in op.authz;
                        const authLabel = isProtected ? "(protected)" : "(public)";
                        // Note: simple template logic for path
                        md += `- \`${op.method} /${s.route}${op.path}\` ${authLabel}\n`;
                    }
                    md += `\n`;
                }
            }
        }
        md += `---\n\n`;

        md += `## Auth rules (summary)\n`;
        md += `- Public endpoints: only those explicitly marked public.\n`;
        md += `- Protected endpoints: require JWT + scopes where specified.\n\n`;
        md += `---\n\n`;

        md += `## Next step\n`;
        md += `Reply **APPROVE** to generate the backend from this blueprint, or reply with changes (e.g., “make browsing private” / “remove payments” / “add categories”).\n`;

        return md;
    }
}
