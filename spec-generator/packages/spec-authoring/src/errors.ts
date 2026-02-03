export class ArchonError extends Error {
    constructor(
        message: string,
        public readonly code:
            | "INVALID_INPUT"
            | "SESSION_NOT_FOUND"
            | "ANSWER_VALIDATION_FAILED"
            | "LLM_INVALID_JSON"
            | "VALIDATION_FAILED"
            | "APPROVAL_REQUIRED"
            | "IO_ERROR" = "INVALID_INPUT"
    ) {
        super(message);
        this.name = "ArchonError";
    }
}
