import { QuestionEngine } from "./deps";
import { ArchonError } from "./errors";
import { SpecSession } from "./types";

type QuestionType = "string" | "number" | "boolean" | "enum";

type PackStep = {
    key: string;
    type: QuestionType;
    required: boolean;
    prompt: string;
    options?: string[];
    default?: any;
    defaultFrom?: string; // e.g. "defaults.currency"
    rules?: { pattern?: string; min?: number; max?: number };
};

type QuestionPack = {
    id: string;
    defaults?: Record<string, any>;
    steps: PackStep[];
    outputs?: {
        moduleIntents?: Record<string, string>; // templated strings like "{answers.payments.provider}"
    };
};

function getByPath(obj: any, dotted: string): any {
    const parts = dotted.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
    }
    return cur;
}

function validateValue(step: PackStep, value: any): string | null {
    if (value === undefined || value === null) {
        return step.required ? "Value is required" : null;
    }

    switch (step.type) {
        case "string": {
            if (typeof value !== "string") return "Must be a string";
            if (step.rules?.pattern) {
                const re = new RegExp(step.rules.pattern);
                if (!re.test(value)) return `Must match pattern ${step.rules.pattern}`;
            }
            return null;
        }
        case "number": {
            if (typeof value !== "number" || Number.isNaN(value)) return "Must be a number";
            if (typeof step.rules?.min === "number" && value < step.rules.min) return `Must be >= ${step.rules.min}`;
            if (typeof step.rules?.max === "number" && value > step.rules.max) return `Must be <= ${step.rules.max}`;
            return null;
        }
        case "boolean": {
            if (typeof value !== "boolean") return "Must be boolean";
            return null;
        }
        case "enum": {
            if (typeof value !== "string") return "Must be a string enum value";
            if (!step.options?.includes(value)) return `Must be one of: ${step.options?.join(", ")}`;
            return null;
        }
        default:
            return "Unknown question type";
    }
}

function applyDefaults(session: SpecSession, pack: QuestionPack): SpecSession {
    const defaultsRoot = { defaults: pack.defaults ?? {} };
    const answers = { ...session.answers };

    for (const step of pack.steps) {
        if (answers[step.key] !== undefined) continue;

        let dv: any = undefined;
        if (step.defaultFrom) dv = getByPath(defaultsRoot, step.defaultFrom);
        else if (step.default !== undefined) dv = step.default;

        if (dv !== undefined) answers[step.key] = dv;
    }

    return { ...session, answers };
}

function renderTemplateStr(template: string, ctx: any): string {
    // supports "{answers.x.y}" tokens
    return template.replace(/\{([^}]+)\}/g, (_m, expr) => {
        const v = getByPath(ctx, expr.trim());
        return v === undefined ? "" : String(v);
    });
}

function computeModuleIntents(pack: QuestionPack, session: SpecSession): Record<string, string> | undefined {
    const intentsTpl = pack.outputs?.moduleIntents;
    if (!intentsTpl) return undefined;

    const ctx = { answers: session.answers };
    const out: Record<string, string> = {};
    for (const [k, tpl] of Object.entries(intentsTpl)) {
        out[k] = renderTemplateStr(tpl, ctx);
    }
    return out;
}

export class RealQuestionEngine implements QuestionEngine {
    async validateAndApply(args: {
        session: SpecSession;
        pack: any;
        set: Record<string, any>;
    }): Promise<SpecSession> {
        const pack = args.pack as QuestionPack;

        // Apply pack defaults first
        let session = applyDefaults(args.session, pack);

        const stepsByKey = new Map(pack.steps.map((s) => [s.key, s]));

        // Validate incoming keys
        for (const [key, value] of Object.entries(args.set)) {
            const step = stepsByKey.get(key);
            if (!step) {
                throw new ArchonError(`Unknown answer key '${key}' for pack '${pack.id}'`, "ANSWER_VALIDATION_FAILED");
            }
            const err = validateValue(step, value);
            if (err) {
                throw new ArchonError(`Invalid value for '${key}': ${err}`, "ANSWER_VALIDATION_FAILED");
            }
        }

        // Merge answers
        session = {
            ...session,
            answers: { ...session.answers, ...args.set }
        };

        // Re-apply defaults (in case earlier steps depend on defaults)
        session = applyDefaults(session, pack);

        // Compute module intents for Phase 3 (kept out of DesignSpec v1)
        const moduleIntents = computeModuleIntents(pack, session);
        if (moduleIntents) {
            session = { ...session, moduleIntents };
        }

        return session;
    }

    async isComplete(args: { session: SpecSession; pack: any }): Promise<boolean> {
        const pack = args.pack as QuestionPack;
        const session = applyDefaults(args.session, pack);

        for (const step of pack.steps) {
            const value = session.answers[step.key];
            const err = validateValue(step, value);
            if (err) return false;
        }
        return true;
    }
}
