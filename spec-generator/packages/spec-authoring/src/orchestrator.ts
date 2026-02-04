import { FileSessionStore, SessionStore } from "./session-store";
import { newSessionId } from "./session-id";
import { hashObj } from "./hash";
import { ArchonError } from "./errors";
import { SpecSession } from "./types";
import {
    PackLoader,
    QuestionEngine,
    LlamaAdapter,
    CompilerGate,
    JsonPatchApplier,
    ConfirmationRenderer,
    UmlRenderer,
    FinalizeOptions
} from "./deps";

function nowIso(): string {
    return new Date().toISOString();
}

export interface SpecOrchestrator {
    initSession(args: { templateId: string; prompt: string }): Promise<SpecSession>;
    showSession(args: { sessionId: string }): Promise<SpecSession>;
    answerSession(args: { sessionId: string; set: Record<string, any> }): Promise<SpecSession>;
    finalizeSession(args: { sessionId: string; options?: FinalizeOptions }): Promise<SpecSession>;
    approveSession(args: { sessionId: string }): Promise<SpecSession>;
    exportSession(args: { sessionId: string; dir: string }): Promise<void>;
}

export class DefaultOrchestrator implements SpecOrchestrator {
    constructor(
        private readonly store: SessionStore,
        private readonly packLoader: PackLoader,
        private readonly questionEngine: QuestionEngine,
        private readonly llama: LlamaAdapter,
        private readonly compiler: CompilerGate,
        private readonly patcher: JsonPatchApplier,
        private readonly confirmation: ConfirmationRenderer,
        private readonly uml: UmlRenderer
    ) { }

    static withFileStore(args: {
        sessionsDir: string;
        packLoader: PackLoader;
        questionEngine: QuestionEngine;
        llama: LlamaAdapter;
        compiler: CompilerGate;
        patcher: JsonPatchApplier;
        confirmation: ConfirmationRenderer;
        uml: UmlRenderer;
    }) {
        return new DefaultOrchestrator(
            new FileSessionStore(args.sessionsDir),
            args.packLoader,
            args.questionEngine,
            args.llama,
            args.compiler,
            args.patcher,
            args.confirmation,
            args.uml
        );
    }

    private enrichWithOpenQuestions(session: SpecSession, pack: any): SpecSession {
        // Filter pack questions that are NOT in answers
        const packQuestions = (pack.questions || []) as any[]; // strict type in real code
        const answeredKeys = new Set(Object.keys(session.answers));

        const open = packQuestions.filter(q => !answeredKeys.has(q.key));

        // Also consider DraftSpec.openQuestions if they are additive?
        // For V1, we trust the pack definition primarily for the "required" set.
        // Prompt says "openQuestions[].key MUST be one of the keys defined in the template pack".
        // So relying on pack.questions is safe and correct.

        session.openQuestions = open;
        return session;
    }

    async initSession(args: { templateId: string; prompt: string }): Promise<SpecSession> {
        const pack = await this.packLoader.load(args.templateId);

        const draftInput = { templateId: args.templateId, prompt: args.prompt };
        const draft = await this.llama.draftFromPrompt({ ...draftInput, pack });

        const session: SpecSession = {
            sessionId: newSessionId(),
            templateId: args.templateId,
            status: "questions",
            userPrompt: args.prompt,
            answers: {},
            draftSpec: draft,
            history: [
                {
                    step: "S1_DraftSpecFromPrompt",
                    ts: nowIso(),
                    inputHash: hashObj(draftInput),
                    outputHash: hashObj(draft)
                }
            ]
        };

        await this.store.create(session);
        return this.enrichWithOpenQuestions(session, pack);
    }

    async showSession(args: { sessionId: string }): Promise<SpecSession> {
        const session = await this.store.get(args.sessionId);
        if (!session.templateId) return session;
        const pack = await this.packLoader.load(session.templateId);
        return this.enrichWithOpenQuestions(session, pack);
    }

    async answerSession(args: { sessionId: string; set: Record<string, any> }): Promise<SpecSession> {
        const session = await this.store.get(args.sessionId);
        if (!session.templateId) throw new ArchonError("Session missing templateId", "INVALID_INPUT");

        const pack = await this.packLoader.load(session.templateId);

        const input = { sessionId: args.sessionId, set: args.set };
        const updated = await this.questionEngine.validateAndApply({ session, pack, set: args.set });

        updated.history.push({
            step: "S3_AnswersApplied",
            ts: nowIso(),
            inputHash: hashObj(input),
            outputHash: hashObj(updated.answers)
        });

        // If complete, remain in questions but ready for finalize
        updated.status = "questions";

        await this.store.put(updated);
        return this.enrichWithOpenQuestions(updated, pack);
    }

    async finalizeSession(args: { sessionId: string; options?: FinalizeOptions }): Promise<SpecSession> {
        const opts: Required<FinalizeOptions> = {
            maxRepairLoops: args.options?.maxRepairLoops ?? 3,
            autoApprove: args.options?.autoApprove ?? false
        };

        const session = await this.store.get(args.sessionId);
        if (!session.templateId) throw new ArchonError("Session missing templateId", "INVALID_INPUT");
        if (!session.draftSpec) throw new ArchonError("Session missing draftSpec", "INVALID_INPUT");

        const pack = await this.packLoader.load(session.templateId);

        const complete = await this.questionEngine.isComplete({ session, pack });
        if (!complete) {
            throw new ArchonError("Required answers missing. Complete Q/A first.", "ANSWER_VALIDATION_FAILED");
        }

        // S4: Polish
        session.status = "polish";
        const polishInput = { draft: session.draftSpec, answers: session.answers };
        const candidate = await this.llama.polishToDesignSpec(polishInput);

        session.candidateSpec = candidate;
        session.history.push({
            step: "S4_PolishToCandidateSpec",
            ts: nowIso(),
            inputHash: hashObj(polishInput),
            outputHash: hashObj(candidate)
        });

        // S5/S6: Validate + repair
        session.status = "validate";

        let current = candidate;
        let lastDiagSig = "";
        for (let i = 0; i <= opts.maxRepairLoops; i++) {
            const res = await this.compiler.compileValidateV1(current);
            session.diagnostics = res.diagnostics;

            const diagSig = hashObj(res.diagnostics.map((d) => `${d.level}:${d.code}:${d.path}`));
            const ok = res.ok;

            session.history.push({
                step: ok ? "S5_CompileValidate_OK" : `S5_CompileValidate_FAIL_${i}`,
                ts: nowIso(),
                inputHash: hashObj(current),
                outputHash: hashObj({ ok, diagnostics: res.diagnostics })
            });

            if (res.normalized) {
                session.finalSpec = res.normalized;
                session.status = opts.autoApprove ? "approved" : "final";
                if (opts.autoApprove) {
                    session.approval = { approved: true, approvedAt: nowIso(), approvedBy: "system" };
                }

                // Render confirmation for UI
                const md = await this.confirmation.render({ session, spec: session.finalSpec });
                session.confirmationMd = md;

                await this.store.put(session);
                return session;
            }

            // Stop if no repairs left
            if (i === opts.maxRepairLoops) break;

            // Stop if not improving
            if (diagSig === lastDiagSig) break;
            lastDiagSig = diagSig;

            session.status = "repair";

            // Ask for JSON Patch
            const patchInput = { candidate: current, diagnostics: res.diagnostics };
            const patch = await this.llama.repairWithJsonPatch(patchInput);

            session.history.push({
                step: `S6_RepairPatch_${i}`,
                ts: nowIso(),
                inputHash: hashObj(patchInput),
                outputHash: hashObj(patch)
            });

            // Apply patch
            current = this.patcher.apply(current, patch);
            session.candidateSpec = current;

            session.history.push({
                step: `S6_ApplyPatch_${i}`,
                ts: nowIso(),
                inputHash: hashObj(patch),
                outputHash: hashObj(current)
            });

            session.status = "validate";
        }

        // If we reach here: failed
        session.status = "final";
        await this.store.put(session);
        throw new ArchonError(
            "Spec could not be validated after repair attempts. See diagnostics in session.",
            "VALIDATION_FAILED"
        );
    }

    async approveSession(args: { sessionId: string }): Promise<SpecSession> {
        const session = await this.store.get(args.sessionId);
        if (!session.finalSpec) throw new ArchonError("No finalSpec to approve. Run finalize first.", "INVALID_INPUT");

        session.approval = { approved: true, approvedAt: nowIso(), approvedBy: "user" };
        session.status = "approved";

        session.history.push({
            step: "S7_UserApproved",
            ts: nowIso(),
            inputHash: hashObj({ sessionId: args.sessionId }),
            outputHash: hashObj(session.approval)
        });

        await this.store.put(session);
        return session;
    }

    async exportSession(args: { sessionId: string; dir: string }): Promise<void> {
        const session = await this.store.get(args.sessionId);
        if (!session.approval?.approved) throw new ArchonError("Approval required before export.", "APPROVAL_REQUIRED");
        if (!session.finalSpec) throw new ArchonError("Missing finalSpec.", "INVALID_INPUT");

        // Render artifacts
        const confirmationMd = await this.confirmation.render({ session, spec: session.finalSpec });
        const umlTxt = await this.uml.render({ spec: session.finalSpec });

        // Write bundle
        const { promises: fs } = await import("fs");
        const path = await import("path");
        await fs.mkdir(args.dir, { recursive: true });

        await fs.writeFile(path.join(args.dir, "spec.json"), JSON.stringify(session.finalSpec, null, 2), "utf8");
        await fs.writeFile(path.join(args.dir, "confirmation.md"), confirmationMd, "utf8");
        await fs.writeFile(path.join(args.dir, "uml.txt"), umlTxt, "utf8");
        await fs.writeFile(path.join(args.dir, "session.json"), JSON.stringify(session, null, 2), "utf8");
        await fs.writeFile(path.join(args.dir, "diagnostics.json"), JSON.stringify(session.diagnostics ?? [], null, 2), "utf8");
    }
}
