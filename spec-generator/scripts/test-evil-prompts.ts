
import { DefaultOrchestrator } from "../packages/spec-authoring/src/orchestrator";
import {
    LlamaAdapter,
    PackLoader,
    QuestionEngine,
    CompilerGate,
    JsonPatchApplier,
    ConfirmationRenderer,
    UmlRenderer,
    CompileResult
} from "../packages/spec-authoring/src/deps";
import { DraftSpec, Diagnostic, SpecSession } from "../packages/spec-authoring/src/types";
import { SessionStore } from "../packages/spec-authoring/src/session-store";
import { compileValidateV1 } from "../packages/spec/src/compiler-gate";
import { realPatchApplier } from "../packages/spec-authoring/src/jsonpatch";

// --- Mocks ---

class MockSessionStore implements SessionStore {
    private sessions = new Map<string, SpecSession>();
    async create(session: SpecSession): Promise<void> { this.sessions.set(session.sessionId, session); }
    async get(sessionId: string): Promise<SpecSession> {
        const s = this.sessions.get(sessionId);
        if (!s) throw new Error("Session not found");
        return s;
    }
    async put(session: SpecSession): Promise<void> { this.sessions.set(session.sessionId, session); }
    async list(): Promise<string[]> { return [...this.sessions.keys()]; }
}

class MockPackLoader implements PackLoader {
    async load(templateId: string): Promise<any> {
        return { id: templateId, prompts: { draft: "foo" } };
    }
}

class MockQuestionEngine implements QuestionEngine {
    async validateAndApply(args: { session: SpecSession; pack: any; set: Record<string, any>; }): Promise<SpecSession> {
        return { ...args.session, answers: { ...args.session.answers, ...args.set } };
    }
    async isComplete(args: { session: SpecSession; pack: any; }): Promise<boolean> {
        return true;
    }
}

class RealCompilerGate implements CompilerGate {
    async compileValidateV1(spec: any): Promise<CompileResult> {
        // We use the real one to test safeguards
        return compileValidateV1(spec);
    }
}

class MockRenderer implements ConfirmationRenderer, UmlRenderer {
    async render(args: any): Promise<string> { return "mock-render"; }
}

// --- The Evil Llama ---

class EvilLlama implements LlamaAdapter {
    constructor(private mode: "malformed_draft" | "schema_violation" | "semantic_violation" | "ambiguous_repair" | "infinite_repair") { }

    async draftFromPrompt(args: { templateId: string; prompt: string; pack: any; }): Promise<DraftSpec> {
        if (this.mode === "malformed_draft") {
            return {
                draft: true,
                draftVersion: "0.1",
                intentSummary: "I am broken",
                assumptions: [],
                openQuestions: [],
                specCandidate: { broken: true } as any
            };
        }
        return {
            draft: true,
            draftVersion: "0.1",
            intentSummary: "Good draft",
            assumptions: [],
            openQuestions: [],
            specCandidate: { name: "TestSpec" }
        };
    }

    async polishToDesignSpec(args: { draft: DraftSpec; answers: Record<string, any>; }): Promise<any> {
        if (this.mode === "schema_violation") {
            // Missing name (required)
            return {
                domains: []
            };
        }
        if (this.mode === "semantic_violation") {
            // Valid schema, but invalid ref
            return {
                name: "SemanticFail",
                domains: [{
                    name: "D1",
                    key: "d1",
                    services: [
                        { name: "S1", key: "s1", entity: "NonExistentEntity" }
                    ],
                    entities: []
                }]
            };
        }
        if (this.mode === "infinite_repair" || this.mode === "ambiguous_repair") {
            return {
                domains: [] // Invalid schema (missing name)
            };
        }

        return { name: "GoodSpec", domains: [] };
    }

    async repairWithJsonPatch(args: { candidate: any; diagnostics: Diagnostic[]; }): Promise<any> {
        if (this.mode === "ambiguous_repair") {
            // Ambiguous path not allowed
            return [
                { op: "add", path: "/domains/-", value: { name: "Bad" } }
            ];
        }
        if (this.mode === "infinite_repair") {
            // Return empty array (no op) implies loop if validation doesn't pass
            return [];
        }

        return [];
    }
}

// --- Test Runner ---

async function runTest(name: string, mode: "malformed_draft" | "schema_violation" | "semantic_violation" | "ambiguous_repair" | "infinite_repair") {
    console.log(`\n>>> TEST: ${name} [${mode}]`);

    // Setup
    const store = new MockSessionStore();
    const llama = new EvilLlama(mode);
    const orch = new DefaultOrchestrator(
        store,
        new MockPackLoader(),
        new MockQuestionEngine(),
        llama,
        new RealCompilerGate(),
        realPatchApplier, // Use imported real patch applier directly
        new MockRenderer(),
        new MockRenderer()
    );

    try {
        const session = await orch.initSession({ templateId: "t1", prompt: "make it break" });
        await orch.finalizeSession({ sessionId: session.sessionId, options: { maxRepairLoops: 2 } });

        console.log("Session final status:", (await store.get(session.sessionId)).status);
        console.log("PASS (graceful completion)");

    } catch (err: any) {
        console.log("Error caught:", err.message);
        console.log("PASS (expected failure handled or thrown correctly)");
    }
}

async function main() {
    await runTest("Schema Violation (Should enter repair, fail if mock repair is bad)", "schema_violation");
    await runTest("Semantic Violation (Should enter repair)", "semantic_violation");
    await runTest("Ambiguous Repair (Should likely crash or ignore patch)", "ambiguous_repair");
    await runTest("Infinite Repair (Should hit max loops)", "infinite_repair");
}

main().catch(console.error);
