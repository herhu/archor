export interface ValidationResult {
    valid: boolean;
    errors: Array<{
        path: string;
        message: string;
        code?: string;
    }>;
}
export declare function validateDiagramIR(ir: unknown): ValidationResult;
