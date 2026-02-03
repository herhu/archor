import { DraftSpec, Diagnostic, SpecSession } from "./types";

export type FinalizeOptions = {
    maxRepairLoops?: number; // default 3
    autoApprove?: boolean;   // default false
};

export type CompileResult = {
    ok: boolean;
    diagnostics: Diagnostic[];
    normalized?: any; // DesignSpec v1 (keep any here; Phase 1 contract)
};

export interface PackLoader {
    // minimal: you can return the pack object later
    load(templateId: string): Promise<any>;
}

export interface QuestionEngine {
    // Validate and store answer key-values; return updated session.answers
    validateAndApply(args: {
        session: SpecSession;
        pack: any;
        set: Record<string, any>;
    }): Promise<SpecSession>;
    isComplete(args: { session: SpecSession; pack: any }): Promise<boolean>;
}

export interface LlamaAdapter {
    draftFromPrompt(args: { templateId: string; prompt: string; pack: any }): Promise<DraftSpec>;
    polishToDesignSpec(args: { draft: DraftSpec; answers: Record<string, any> }): Promise<any>; // DesignSpec v1 candidate
    repairWithJsonPatch(args: { candidate: any; diagnostics: Diagnostic[] }): Promise<any>; // RFC6902 patch array/object
}

export interface CompilerGate {
    compileValidateV1(spec: any): Promise<CompileResult>;
}

export interface JsonPatchApplier {
    apply(candidate: any, patch: any): any;
}

export interface ConfirmationRenderer {
    render(args: { session: SpecSession; spec: any }): Promise<string>;
}

export interface UmlRenderer {
    render(args: { spec: any }): Promise<string>;
}
