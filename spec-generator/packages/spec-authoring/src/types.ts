export type ISO8601 = string;

export type SessionStatus =
    | "draft"
    | "questions"
    | "polish"
    | "validate"
    | "repair"
    | "approved"
    | "final";

export type Primitive = string | number | boolean | null;
export type AnswerValue = Primitive | Primitive[] | Record<string, any>;

export type DiagnosticLevel = "error" | "warn";

export type Diagnostic = {
    code: string;
    level: DiagnosticLevel;
    path: string; // JSON pointer
    message: string;
    suggestion?: string;
};

export type OpenQuestion = {
    key: string;
    question: string;
    default?: AnswerValue;
    options?: AnswerValue[];
};

export type DraftSpec = {
    draft: true;
    draftVersion: "0.1";
    intentSummary: string;
    assumptions: string[];
    openQuestions: OpenQuestion[];
    specCandidate: any; // stays any until you import DesignSpecV1 types here
};

export type ModuleIntents = Record<string, string>;

export type StepHistory = {
    step: string;
    ts: ISO8601;
    inputHash: string;
    outputHash: string;
};

export type Approval = {
    approved: boolean;
    approvedAt?: ISO8601;
    approvedBy?: "user" | "system";
};

export type SpecSession = {
    sessionId: string;
    templateId?: string;

    status: SessionStatus;

    userPrompt: string;

    answers: Record<string, AnswerValue>;
    moduleIntents?: ModuleIntents;

    draftSpec?: DraftSpec;
    candidateSpec?: any;
    diagnostics?: Diagnostic[];

    finalSpec?: any;
    approval?: Approval;

    history: StepHistory[];
};
