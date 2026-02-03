import { LlamaAdapter } from "./deps";
import { DraftSpec, Diagnostic } from "./types";
import { ArchonError } from "./errors";
import * as fs from "fs";
import * as path from "path";

type OllamaChatResponse = {
    message?: { content?: string };
    response?: string; // some versions use response
};

function mustJsonParse<T>(raw: string): T {
    try {
        return JSON.parse(raw) as T;
    } catch {
        throw new ArchonError("LLM returned invalid JSON", "LLM_INVALID_JSON");
    }
}

async function callOllama(args: {
    host: string;
    model: string;
    system: string;
    user: string;
    temperature: number;
    numPredict: number;
}): Promise<string> {
    const url = `${args.host.replace(/\/+$/, "")}/api/chat`;
    const body = {
        model: args.model,
        stream: false,
        temperature: args.temperature,
        num_predict: args.numPredict,
        messages: [
            { role: "system", content: args.system },
            { role: "user", content: args.user }
        ]
    };

    const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new ArchonError(`Ollama error ${res.status}: ${txt}`, "IO_ERROR");
    }

    const json = (await res.json()) as OllamaChatResponse;
    const content = json.message?.content ?? json.response ?? "";
    return content.trim();
}

function loadPrompt(fileRel: string): string {
    // prompts live under packages/spec-authoring/prompts/
    const p = path.join(process.cwd(), "packages", "spec-authoring", "prompts", fileRel);
    return fs.readFileSync(p, "utf8");
}

function render(template: string, vars: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_m, k) => String(vars[k] ?? ""));
}

async function jsonOnlyCallWithRetry<T>(
    fn: () => Promise<string>,
    retryOnce = true,
    validator?: (val: T) => void
): Promise<T> {
    const raw1 = await fn();
    try {
        const parsed = mustJsonParse<T>(raw1);
        if (validator) validator(parsed);
        return parsed;
    } catch (e) {
        if (!retryOnce) throw e;
        // minimal “format reminder” retry: append strict instruction
        // We'll just call the function again for now, trusting the model/system prompt holds.
        // In a real agent we might append "You output invalid JSON/Type. Fix it." to the messages.
        const raw2 = await fn();
        const parsed2 = mustJsonParse<T>(raw2);
        if (validator) validator(parsed2);
        return parsed2;
    }
}

export function buildOllamaLlamaAdapter(opts?: {
    host?: string;         // default http://127.0.0.1:11434
    model?: string;        // default llama3.1:8b (fallback)
    modelDraft?: string;   // specific
    modelPolish?: string;  // specific
    modelRepair?: string;  // specific
    temperature?: number;  // default 0.2
    numPredict?: number;   // default 2048
}): LlamaAdapter {
    const host = opts?.host ?? process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
    const defaultModel = opts?.model ?? process.env.OLLAMA_MODEL ?? "llama3.1:8b";
    const temperature = opts?.temperature ?? 0.2;
    const numPredict = opts?.numPredict ?? 2048;

    const getModel = (phase: "draft" | "polish" | "repair") => {
        if (phase === "draft") return opts?.modelDraft ?? defaultModel;
        if (phase === "polish") return opts?.modelPolish ?? defaultModel;
        if (phase === "repair") return opts?.modelRepair ?? defaultModel;
        return defaultModel;
    };

    const draftT = loadPrompt("draft-spec.prompt.txt");
    const polishT = loadPrompt("polish-to-designspec.prompt.txt");
    const repairT = loadPrompt("repair-jsonpatch.prompt.txt");

    // system message: keep it strict
    const system = "Return ONLY valid JSON. No markdown. No commentary. No extra keys beyond requested.";

    return {
        async draftFromPrompt({ templateId, prompt, pack }): Promise<DraftSpec> {
            const user = render(draftT, {
                PACK_CONTEXT_JSON: JSON.stringify({ templateId, pack }, null, 2),
                USER_PROMPT: prompt
            });

            return jsonOnlyCallWithRetry<DraftSpec>(() =>
                callOllama({ host, model: getModel("draft"), system, user, temperature, numPredict })
            );
        },

        async polishToDesignSpec({ draft, answers }): Promise<any> {
            const user = render(polishT, {
                DRAFTSPEC_JSON: JSON.stringify(draft, null, 2),
                ANSWERS_JSON: JSON.stringify(answers, null, 2)
            });

            return jsonOnlyCallWithRetry<any>(() =>
                callOllama({ host, model: getModel("polish"), system, user, temperature, numPredict })
            );
        },

        async repairWithJsonPatch({ candidate, diagnostics }): Promise<any> {
            const user = render(repairT, {
                CANDIDATE_JSON: JSON.stringify(candidate, null, 2),
                DIAGNOSTICS_JSON: JSON.stringify(diagnostics as Diagnostic[], null, 2)
            });

            // patch array only
            return jsonOnlyCallWithRetry<any>(
                () => callOllama({ host, model: getModel("repair"), system, user, temperature, numPredict: 1024 }),
                true,
                (parsed) => {
                    if (!Array.isArray(parsed)) {
                        throw new ArchonError("LLM output must be an array of patch ops", "LLM_INVALID_JSON");
                    }
                }
            );
        }
    };
}
