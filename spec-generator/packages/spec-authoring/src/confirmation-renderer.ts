import { ConfirmationRenderer } from "./deps";
import { SpecSession } from "./types";
import { DesignSpecV1 } from "../../spec/src/designspec-v1";

export class SimpleConfirmationRenderer implements ConfirmationRenderer {
    async render(args: { session: SpecSession; spec: any }): Promise<string> {
        const spec = args.spec as DesignSpecV1;
        const answers = args.session.answers;

        // Helper to get answer safely
        const a = (key: string) => String(answers[key] ?? "N/A");

        let md = `# 🏗️ Architecture Confirmation — ${a("app.name")}\n\n`;

        md += `## 📋 Executive Summary\n`;
        md += `This design blueprint outlines a **${a("ecommerce.catalog.type") || "custom"}** marketplace architecture tailored for **${a("auth.mode")}** access.\n`;
        md += `The system is designed to handle **${a("inventory.mode")}** inventory complexity and transacts in **${a("catalog.currency") || "USD"}**.\n\n`;

        md += `## 🔌 Integration Strategy\n`;
        md += `| Component | Status | Provider |\n`;
        md += `| :--- | :--- | :--- |\n`;
        md += `| **Payments** | ${a("payments.provider") === "none" ? "Excluded" : "Active"} | **${a("payments.provider")}** |\n`;
        md += `| **Email** | ${a("email.provider") === "none" ? "Excluded" : "Active"} | **${a("email.provider")}** |\n`;
        md += `| **Delivery** | ${a("delivery.provider") === "none" ? "Excluded" : "Active"} | **${a("delivery.provider")}** |\n\n`;

        md += `## 📦 Data Model (Snapshot)\n`;
        for (const d of spec.domains) {
            md += `### ${d.name}\n`;
            for (const e of d.entities) {
                md += `- **${e.name}**: ${e.fields.map(f => f.name).join(", ")}\n`;
            }
        }
        md += `\n`;

        md += `## 🚀 API Surface\n`;
        for (const d of spec.domains) {
            for (const s of d.services) {
                const count = (s.operations?.length ?? 0) + s.crud.length;
                md += `- **${s.name}**: ${count} endpoints (/${s.route})\n`;
            }
        }
        md += `\n---\n`;
        md += `**Reply APPROVE to compile implementation.**\n`;

        return md;
    }
}
