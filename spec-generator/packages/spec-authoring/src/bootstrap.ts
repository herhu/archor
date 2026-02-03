import path from "path";
import fs from "fs";
import { DefaultOrchestrator } from "./orchestrator";
import { FsPackLoader } from "./pack-loader.fs";
import { RealQuestionEngine } from "./question-engine";
import { compileValidateV1 } from "../../spec/src/compiler-gate";
import { realPatchApplier } from "./jsonpatch";
import { buildOllamaLlamaAdapter } from "./llama-runner.ollama";
import { SimpleConfirmationRenderer } from "./confirmation-renderer";
import { SimpleUmlRenderer } from "./uml-renderer";
import { CompilerGate } from "./deps";

// Adapter for compiler gate (matches interface)
const realCompilerGate: CompilerGate = {
    async compileValidateV1(spec: any) {
        const res = compileValidateV1(spec);
        return {
            ok: res.ok,
            diagnostics: res.diagnostics,
            normalized: res.normalized
        };
    }
};

export function buildRealOrchestrator() {
    const packsDir = path.join(process.cwd(), "packages", "spec-authoring", "packs");
    const sessionsDir = path.join(process.cwd(), "sessions");

    // Basic config loading
    let config: any = {};
    try {
        const configPath = path.join(process.cwd(), "archon.config.json");
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (e) {
        // ignore
    }

    const llm = config.llm || {};
    const models = llm.models || {};

    return DefaultOrchestrator.withFileStore({
        sessionsDir,
        packLoader: new FsPackLoader(packsDir),
        questionEngine: new RealQuestionEngine(),
        llama: buildOllamaLlamaAdapter({
            host: llm.host,
            model: undefined, // let adapter use defaults or config override
            modelDraft: models.draft,
            modelPolish: models.polish,
            modelRepair: models.repair,
            temperature: 0.2, // could be phased
            numPredict: 2048
        }),
        compiler: realCompilerGate,
        patcher: realPatchApplier,
        confirmation: new SimpleConfirmationRenderer(),
        uml: new SimpleUmlRenderer()
    });
}
