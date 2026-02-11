import { z } from 'zod';
export declare const IdSchema: z.ZodString;
export declare const RefSchema: z.ZodString;
export declare const PositionSchema: z.ZodObject<{
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
    w: z.ZodOptional<z.ZodNumber>;
    h: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    x?: number | undefined;
    y?: number | undefined;
    w?: number | undefined;
    h?: number | undefined;
}, {
    x?: number | undefined;
    y?: number | undefined;
    w?: number | undefined;
    h?: number | undefined;
}>;
export declare const SourceSpanSchema: z.ZodObject<{
    startLine: z.ZodNumber;
    startCol: z.ZodNumber;
    endLine: z.ZodNumber;
    endCol: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    startLine: number;
    startCol: number;
    endLine: number;
    endCol: number;
}, {
    startLine: number;
    startCol: number;
    endLine: number;
    endCol: number;
}>;
export declare const TaggedValueSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
    namespace: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string | number | boolean | null;
    key: string;
    namespace?: string | undefined;
}, {
    value: string | number | boolean | null;
    key: string;
    namespace?: string | undefined;
}>;
export declare const DocumentationSchema: z.ZodObject<{
    summary: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodString>;
    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    summary?: string | undefined;
    details?: string | undefined;
    examples?: string[] | undefined;
}, {
    summary?: string | undefined;
    details?: string | undefined;
    examples?: string[] | undefined;
}>;
export declare const DiagnosticSchema: z.ZodObject<{
    severity: z.ZodEnum<["info", "warning", "error"]>;
    code: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    severity: "info" | "warning" | "error";
    code?: string | undefined;
    path?: string | undefined;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
}, {
    message: string;
    severity: "info" | "warning" | "error";
    code?: string | undefined;
    path?: string | undefined;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
}>;
export declare const ElementBaseSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    name: z.ZodString;
    stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }>>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
}, {
    type: string;
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
}>;
export declare const VisibilitySchema: z.ZodEnum<["public", "protected", "private", "package"]>;
export declare const TypeRefSchema: z.ZodType<any>;
export declare const AttributeSchema: z.ZodObject<{
    name: z.ZodString;
    visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
    typeRef: z.ZodType<any, z.ZodTypeDef, any>;
    static: z.ZodOptional<z.ZodBoolean>;
    readonly: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    visibility?: "public" | "protected" | "private" | "package" | undefined;
    typeRef?: any;
    static?: boolean | undefined;
    readonly?: boolean | undefined;
    default?: string | number | boolean | null | undefined;
}, {
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    visibility?: "public" | "protected" | "private" | "package" | undefined;
    typeRef?: any;
    static?: boolean | undefined;
    readonly?: boolean | undefined;
    default?: string | number | boolean | null | undefined;
}>;
export declare const ParameterSchema: z.ZodObject<{
    name: z.ZodString;
    typeRef: z.ZodType<any, z.ZodTypeDef, any>;
    default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    typeRef?: any;
    default?: string | number | boolean | null | undefined;
}, {
    name: string;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    typeRef?: any;
    default?: string | number | boolean | null | undefined;
}>;
export declare const OperationSchema: z.ZodObject<{
    name: z.ZodString;
    visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
    params: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        typeRef: z.ZodType<any, z.ZodTypeDef, any>;
        default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        typeRef?: any;
        default?: string | number | boolean | null | undefined;
    }, {
        name: string;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        typeRef?: any;
        default?: string | number | boolean | null | undefined;
    }>, "many">>;
    returns: z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>;
    static: z.ZodOptional<z.ZodBoolean>;
    abstract: z.ZodOptional<z.ZodBoolean>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    params?: {
        name: string;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        typeRef?: any;
        default?: string | number | boolean | null | undefined;
    }[] | undefined;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    visibility?: "public" | "protected" | "private" | "package" | undefined;
    static?: boolean | undefined;
    returns?: any;
    abstract?: boolean | undefined;
}, {
    name: string;
    params?: {
        name: string;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        typeRef?: any;
        default?: string | number | boolean | null | undefined;
    }[] | undefined;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    visibility?: "public" | "protected" | "private" | "package" | undefined;
    static?: boolean | undefined;
    returns?: any;
    abstract?: boolean | undefined;
}>;
export declare const ClassSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }>>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
} & {
    type: z.ZodLiteral<"classifier">;
    kind: z.ZodEnum<["class", "abstract", "interface", "enum", "valueobject"]>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
        typeRef: z.ZodType<any, z.ZodTypeDef, any>;
        static: z.ZodOptional<z.ZodBoolean>;
        readonly: z.ZodOptional<z.ZodBoolean>;
        default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        typeRef?: any;
        static?: boolean | undefined;
        readonly?: boolean | undefined;
        default?: string | number | boolean | null | undefined;
    }, {
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        typeRef?: any;
        static?: boolean | undefined;
        readonly?: boolean | undefined;
        default?: string | number | boolean | null | undefined;
    }>, "many">>;
    operations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
        params: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            typeRef: z.ZodType<any, z.ZodTypeDef, any>;
            default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }, {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }>, "many">>;
        returns: z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>;
        static: z.ZodOptional<z.ZodBoolean>;
        abstract: z.ZodOptional<z.ZodBoolean>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        params?: {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        static?: boolean | undefined;
        returns?: any;
        abstract?: boolean | undefined;
    }, {
        name: string;
        params?: {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        static?: boolean | undefined;
        returns?: any;
        abstract?: boolean | undefined;
    }>, "many">>;
    extends: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    implements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "classifier";
    id: string;
    name: string;
    kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
    attributes?: {
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        typeRef?: any;
        static?: boolean | undefined;
        readonly?: boolean | undefined;
        default?: string | number | boolean | null | undefined;
    }[] | undefined;
    operations?: {
        name: string;
        params?: {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        static?: boolean | undefined;
        returns?: any;
        abstract?: boolean | undefined;
    }[] | undefined;
    extends?: string[] | undefined;
    implements?: string[] | undefined;
}, {
    type: "classifier";
    id: string;
    name: string;
    kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
    attributes?: {
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        typeRef?: any;
        static?: boolean | undefined;
        readonly?: boolean | undefined;
        default?: string | number | boolean | null | undefined;
    }[] | undefined;
    operations?: {
        name: string;
        params?: {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        static?: boolean | undefined;
        returns?: any;
        abstract?: boolean | undefined;
    }[] | undefined;
    extends?: string[] | undefined;
    implements?: string[] | undefined;
}>;
export declare const PortSchema: z.ZodObject<{
    name: z.ZodString;
    direction: z.ZodEnum<["provides", "requires"]>;
    interface: z.ZodOptional<z.ZodString>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    direction: "provides" | "requires";
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    interface?: string | undefined;
}, {
    name: string;
    direction: "provides" | "requires";
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    interface?: string | undefined;
}>;
export declare const ComponentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }>>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
} & {
    type: z.ZodLiteral<"component">;
    ports: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        direction: z.ZodEnum<["provides", "requires"]>;
        interface: z.ZodOptional<z.ZodString>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        direction: "provides" | "requires";
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        interface?: string | undefined;
    }, {
        name: string;
        direction: "provides" | "requires";
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        interface?: string | undefined;
    }>, "many">>;
    contains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "component";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
    ports?: {
        name: string;
        direction: "provides" | "requires";
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        interface?: string | undefined;
    }[] | undefined;
    contains?: string[] | undefined;
}, {
    type: "component";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
    ports?: {
        name: string;
        direction: "provides" | "requires";
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        interface?: string | undefined;
    }[] | undefined;
    contains?: string[] | undefined;
}>;
export declare const EnumLiteralSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodNull]>>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    value?: string | number | null | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    value?: string | number | null | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
}>;
export declare const MultiplicitySchema: z.ZodString;
export declare const RelationshipSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["association", "aggregation", "composition", "dependency", "realization", "generalization", "usecase-association", "include", "extend", "message"]>;
    from: z.ZodString;
    to: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    fromMultiplicity: z.ZodOptional<z.ZodString>;
    toMultiplicity: z.ZodOptional<z.ZodString>;
    navigability: z.ZodOptional<z.ZodEnum<["none", "from-to", "to-from", "both"]>>;
    kind: z.ZodOptional<z.ZodEnum<["sync", "async", "reply", "create", "destroy"]>>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
    id: string;
    from: string;
    to: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
    label?: string | undefined;
    fromMultiplicity?: string | undefined;
    toMultiplicity?: string | undefined;
    navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
}, {
    type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
    id: string;
    from: string;
    to: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
    label?: string | undefined;
    fromMultiplicity?: string | undefined;
    toMultiplicity?: string | undefined;
    navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
}>;
export declare const ActorSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }>>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
} & {
    type: z.ZodLiteral<"actor">;
}, "strip", z.ZodTypeAny, {
    type: "actor";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
}, {
    type: "actor";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
}>;
export declare const UseCaseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }>>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
} & {
    type: z.ZodLiteral<"usecase">;
}, "strip", z.ZodTypeAny, {
    type: "usecase";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
}, {
    type: "usecase";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
}>;
export declare const InterfaceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }>>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
} & {
    type: z.ZodLiteral<"interface">;
    operations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
        params: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            typeRef: z.ZodType<any, z.ZodTypeDef, any>;
            default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }, {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }>, "many">>;
        returns: z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>;
        static: z.ZodOptional<z.ZodBoolean>;
        abstract: z.ZodOptional<z.ZodBoolean>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        params?: {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        static?: boolean | undefined;
        returns?: any;
        abstract?: boolean | undefined;
    }, {
        name: string;
        params?: {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        static?: boolean | undefined;
        returns?: any;
        abstract?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "interface";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
    operations?: {
        name: string;
        params?: {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        static?: boolean | undefined;
        returns?: any;
        abstract?: boolean | undefined;
    }[] | undefined;
}, {
    type: "interface";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
    operations?: {
        name: string;
        params?: {
            name: string;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            typeRef?: any;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        visibility?: "public" | "protected" | "private" | "package" | undefined;
        static?: boolean | undefined;
        returns?: any;
        abstract?: boolean | undefined;
    }[] | undefined;
}>;
export declare const ParticipantSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
        w: z.ZodOptional<z.ZodNumber>;
        h: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }, {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    }>>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
} & {
    type: z.ZodLiteral<"participant">;
    role: z.ZodOptional<z.ZodEnum<["actor", "boundary", "control", "entity", "service", "component", "database", "queue", "external"]>>;
    classifier: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "participant";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
    classifier?: string | undefined;
    role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
}, {
    type: "participant";
    id: string;
    name: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    stereotypes?: string[] | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    position?: {
        x?: number | undefined;
        y?: number | undefined;
        w?: number | undefined;
        h?: number | undefined;
    } | undefined;
    classifier?: string | undefined;
    role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
}>;
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    from: z.ZodString;
    to: z.ZodString;
    kind: z.ZodEnum<["sync", "async", "reply", "create", "destroy"]>;
    label: z.ZodOptional<z.ZodString>;
    sequence: z.ZodOptional<z.ZodNumber>;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
        namespace: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }, {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    kind: "sync" | "async" | "reply" | "create" | "destroy";
    from: string;
    to: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    label?: string | undefined;
    sequence?: number | undefined;
}, {
    id: string;
    kind: "sync" | "async" | "reply" | "create" | "destroy";
    from: string;
    to: string;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    tags?: {
        value: string | number | boolean | null;
        key: string;
        namespace?: string | undefined;
    }[] | undefined;
    label?: string | undefined;
    sequence?: number | undefined;
}>;
export declare const FragmentSchema: z.ZodObject<{
    kind: z.ZodEnum<["alt", "opt", "loop", "par", "break", "critical"]>;
    condition: z.ZodOptional<z.ZodString>;
    start: z.ZodNumber;
    end: z.ZodNumber;
    span: z.ZodOptional<z.ZodObject<{
        startLine: z.ZodNumber;
        startCol: z.ZodNumber;
        endLine: z.ZodNumber;
        endCol: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }, {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
    start: number;
    end: number;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    condition?: string | undefined;
}, {
    kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
    start: number;
    end: number;
    span?: {
        startLine: number;
        startCol: number;
        endLine: number;
        endCol: number;
    } | undefined;
    condition?: string | undefined;
}>;
export declare const DiagramSchema: z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<["usecase", "class", "component", "sequence"]>;
    name: z.ZodString;
    doc: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }, {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    }>>;
    elements: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodOptional<z.ZodNumber>;
            y: z.ZodOptional<z.ZodNumber>;
            w: z.ZodOptional<z.ZodNumber>;
            h: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }>>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    } & {
        type: z.ZodLiteral<"actor">;
    }, "strip", z.ZodTypeAny, {
        type: "actor";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
    }, {
        type: "actor";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodOptional<z.ZodNumber>;
            y: z.ZodOptional<z.ZodNumber>;
            w: z.ZodOptional<z.ZodNumber>;
            h: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }>>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    } & {
        type: z.ZodLiteral<"usecase">;
    }, "strip", z.ZodTypeAny, {
        type: "usecase";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
    }, {
        type: "usecase";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodOptional<z.ZodNumber>;
            y: z.ZodOptional<z.ZodNumber>;
            w: z.ZodOptional<z.ZodNumber>;
            h: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }>>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    } & {
        type: z.ZodLiteral<"classifier">;
        kind: z.ZodEnum<["class", "abstract", "interface", "enum", "valueobject"]>;
        attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
            typeRef: z.ZodType<any, z.ZodTypeDef, any>;
            static: z.ZodOptional<z.ZodBoolean>;
            readonly: z.ZodOptional<z.ZodBoolean>;
            default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            typeRef?: any;
            static?: boolean | undefined;
            readonly?: boolean | undefined;
            default?: string | number | boolean | null | undefined;
        }, {
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            typeRef?: any;
            static?: boolean | undefined;
            readonly?: boolean | undefined;
            default?: string | number | boolean | null | undefined;
        }>, "many">>;
        operations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
            params: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                typeRef: z.ZodType<any, z.ZodTypeDef, any>;
                default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
                doc: z.ZodOptional<z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    details: z.ZodOptional<z.ZodString>;
                    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }, {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }>, "many">>;
            returns: z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>;
            static: z.ZodOptional<z.ZodBoolean>;
            abstract: z.ZodOptional<z.ZodBoolean>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }, {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }>, "many">>;
        extends: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        implements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "classifier";
        id: string;
        name: string;
        kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        attributes?: {
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            typeRef?: any;
            static?: boolean | undefined;
            readonly?: boolean | undefined;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        operations?: {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }[] | undefined;
        extends?: string[] | undefined;
        implements?: string[] | undefined;
    }, {
        type: "classifier";
        id: string;
        name: string;
        kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        attributes?: {
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            typeRef?: any;
            static?: boolean | undefined;
            readonly?: boolean | undefined;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        operations?: {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }[] | undefined;
        extends?: string[] | undefined;
        implements?: string[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodOptional<z.ZodNumber>;
            y: z.ZodOptional<z.ZodNumber>;
            w: z.ZodOptional<z.ZodNumber>;
            h: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }>>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    } & {
        type: z.ZodLiteral<"component">;
        ports: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            direction: z.ZodEnum<["provides", "requires"]>;
            interface: z.ZodOptional<z.ZodString>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            direction: "provides" | "requires";
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            interface?: string | undefined;
        }, {
            name: string;
            direction: "provides" | "requires";
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            interface?: string | undefined;
        }>, "many">>;
        contains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "component";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        ports?: {
            name: string;
            direction: "provides" | "requires";
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            interface?: string | undefined;
        }[] | undefined;
        contains?: string[] | undefined;
    }, {
        type: "component";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        ports?: {
            name: string;
            direction: "provides" | "requires";
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            interface?: string | undefined;
        }[] | undefined;
        contains?: string[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodOptional<z.ZodNumber>;
            y: z.ZodOptional<z.ZodNumber>;
            w: z.ZodOptional<z.ZodNumber>;
            h: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }>>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    } & {
        type: z.ZodLiteral<"interface">;
        operations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
            params: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                typeRef: z.ZodType<any, z.ZodTypeDef, any>;
                default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
                doc: z.ZodOptional<z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    details: z.ZodOptional<z.ZodString>;
                    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }, {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }>, "many">>;
            returns: z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>;
            static: z.ZodOptional<z.ZodBoolean>;
            abstract: z.ZodOptional<z.ZodBoolean>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }, {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "interface";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        operations?: {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }[] | undefined;
    }, {
        type: "interface";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        operations?: {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodOptional<z.ZodNumber>;
            y: z.ZodOptional<z.ZodNumber>;
            w: z.ZodOptional<z.ZodNumber>;
            h: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }, {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        }>>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    } & {
        type: z.ZodLiteral<"participant">;
        role: z.ZodOptional<z.ZodEnum<["actor", "boundary", "control", "entity", "service", "component", "database", "queue", "external"]>>;
        classifier: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "participant";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        classifier?: string | undefined;
        role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
    }, {
        type: "participant";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        classifier?: string | undefined;
        role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
    }>]>, "many">;
    relationships: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["association", "aggregation", "composition", "dependency", "realization", "generalization", "usecase-association", "include", "extend", "message"]>;
        from: z.ZodString;
        to: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        fromMultiplicity: z.ZodOptional<z.ZodString>;
        toMultiplicity: z.ZodOptional<z.ZodString>;
        navigability: z.ZodOptional<z.ZodEnum<["none", "from-to", "to-from", "both"]>>;
        kind: z.ZodOptional<z.ZodEnum<["sync", "async", "reply", "create", "destroy"]>>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
            namespace: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }, {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
        id: string;
        from: string;
        to: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
        label?: string | undefined;
        fromMultiplicity?: string | undefined;
        toMultiplicity?: string | undefined;
        navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
    }, {
        type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
        id: string;
        from: string;
        to: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
        label?: string | undefined;
        fromMultiplicity?: string | undefined;
        toMultiplicity?: string | undefined;
        navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
    }>, "many">;
    fragments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<["alt", "opt", "loop", "par", "break", "critical"]>;
        condition: z.ZodOptional<z.ZodString>;
        start: z.ZodNumber;
        end: z.ZodNumber;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
        start: number;
        end: number;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        condition?: string | undefined;
    }, {
        kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
        start: number;
        end: number;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        condition?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    kind: "class" | "component" | "usecase" | "sequence";
    elements: ({
        type: "classifier";
        id: string;
        name: string;
        kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        attributes?: {
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            typeRef?: any;
            static?: boolean | undefined;
            readonly?: boolean | undefined;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        operations?: {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }[] | undefined;
        extends?: string[] | undefined;
        implements?: string[] | undefined;
    } | {
        type: "component";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        ports?: {
            name: string;
            direction: "provides" | "requires";
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            interface?: string | undefined;
        }[] | undefined;
        contains?: string[] | undefined;
    } | {
        type: "actor";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
    } | {
        type: "usecase";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
    } | {
        type: "interface";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        operations?: {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }[] | undefined;
    } | {
        type: "participant";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        classifier?: string | undefined;
        role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
    })[];
    relationships: {
        type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
        id: string;
        from: string;
        to: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
        label?: string | undefined;
        fromMultiplicity?: string | undefined;
        toMultiplicity?: string | undefined;
        navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
    }[];
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    fragments?: {
        kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
        start: number;
        end: number;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        condition?: string | undefined;
    }[] | undefined;
}, {
    id: string;
    name: string;
    kind: "class" | "component" | "usecase" | "sequence";
    elements: ({
        type: "classifier";
        id: string;
        name: string;
        kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        attributes?: {
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            typeRef?: any;
            static?: boolean | undefined;
            readonly?: boolean | undefined;
            default?: string | number | boolean | null | undefined;
        }[] | undefined;
        operations?: {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }[] | undefined;
        extends?: string[] | undefined;
        implements?: string[] | undefined;
    } | {
        type: "component";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        ports?: {
            name: string;
            direction: "provides" | "requires";
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            interface?: string | undefined;
        }[] | undefined;
        contains?: string[] | undefined;
    } | {
        type: "actor";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
    } | {
        type: "usecase";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
    } | {
        type: "interface";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        operations?: {
            name: string;
            params?: {
                name: string;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                typeRef?: any;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            visibility?: "public" | "protected" | "private" | "package" | undefined;
            static?: boolean | undefined;
            returns?: any;
            abstract?: boolean | undefined;
        }[] | undefined;
    } | {
        type: "participant";
        id: string;
        name: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        stereotypes?: string[] | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            w?: number | undefined;
            h?: number | undefined;
        } | undefined;
        classifier?: string | undefined;
        role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
    })[];
    relationships: {
        type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
        id: string;
        from: string;
        to: string;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        tags?: {
            value: string | number | boolean | null;
            key: string;
            namespace?: string | undefined;
        }[] | undefined;
        kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
        label?: string | undefined;
        fromMultiplicity?: string | undefined;
        toMultiplicity?: string | undefined;
        navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
    }[];
    doc?: {
        summary?: string | undefined;
        details?: string | undefined;
        examples?: string[] | undefined;
    } | undefined;
    fragments?: {
        kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
        start: number;
        end: number;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
        condition?: string | undefined;
    }[] | undefined;
}>;
export declare const DiagramIRSchema: z.ZodObject<{
    version: z.ZodLiteral<"1.0.0">;
    source: z.ZodOptional<z.ZodObject<{
        kind: z.ZodOptional<z.ZodEnum<["ascii-dsl", "image", "other"]>>;
        uri: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        kind?: "ascii-dsl" | "image" | "other" | undefined;
        uri?: string | undefined;
        text?: string | undefined;
        hash?: string | undefined;
        createdAt?: string | undefined;
    }, {
        kind?: "ascii-dsl" | "image" | "other" | undefined;
        uri?: string | undefined;
        text?: string | undefined;
        hash?: string | undefined;
        createdAt?: string | undefined;
    }>>;
    diagrams: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodEnum<["usecase", "class", "component", "sequence"]>;
        name: z.ZodString;
        doc: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodString>;
            examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }, {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        }>>;
        elements: z.ZodArray<z.ZodUnion<[z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodOptional<z.ZodNumber>;
                y: z.ZodOptional<z.ZodNumber>;
                w: z.ZodOptional<z.ZodNumber>;
                h: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }>>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        } & {
            type: z.ZodLiteral<"actor">;
        }, "strip", z.ZodTypeAny, {
            type: "actor";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        }, {
            type: "actor";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodOptional<z.ZodNumber>;
                y: z.ZodOptional<z.ZodNumber>;
                w: z.ZodOptional<z.ZodNumber>;
                h: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }>>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        } & {
            type: z.ZodLiteral<"usecase">;
        }, "strip", z.ZodTypeAny, {
            type: "usecase";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        }, {
            type: "usecase";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodOptional<z.ZodNumber>;
                y: z.ZodOptional<z.ZodNumber>;
                w: z.ZodOptional<z.ZodNumber>;
                h: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }>>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        } & {
            type: z.ZodLiteral<"classifier">;
            kind: z.ZodEnum<["class", "abstract", "interface", "enum", "valueobject"]>;
            attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
                typeRef: z.ZodType<any, z.ZodTypeDef, any>;
                static: z.ZodOptional<z.ZodBoolean>;
                readonly: z.ZodOptional<z.ZodBoolean>;
                default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
                doc: z.ZodOptional<z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    details: z.ZodOptional<z.ZodString>;
                    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }>>;
                tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                    namespace: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }, {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }>, "many">>;
                span: z.ZodOptional<z.ZodObject<{
                    startLine: z.ZodNumber;
                    startCol: z.ZodNumber;
                    endLine: z.ZodNumber;
                    endCol: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                }, {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                }>>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                typeRef?: any;
                static?: boolean | undefined;
                readonly?: boolean | undefined;
                default?: string | number | boolean | null | undefined;
            }, {
                name: string;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                typeRef?: any;
                static?: boolean | undefined;
                readonly?: boolean | undefined;
                default?: string | number | boolean | null | undefined;
            }>, "many">>;
            operations: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
                params: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    typeRef: z.ZodType<any, z.ZodTypeDef, any>;
                    default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
                    doc: z.ZodOptional<z.ZodObject<{
                        summary: z.ZodOptional<z.ZodString>;
                        details: z.ZodOptional<z.ZodString>;
                        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    }, "strip", z.ZodTypeAny, {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    }, {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }, {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }>, "many">>;
                returns: z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>;
                static: z.ZodOptional<z.ZodBoolean>;
                abstract: z.ZodOptional<z.ZodBoolean>;
                doc: z.ZodOptional<z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    details: z.ZodOptional<z.ZodString>;
                    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }>>;
                tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                    namespace: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }, {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }>, "many">>;
                span: z.ZodOptional<z.ZodObject<{
                    startLine: z.ZodNumber;
                    startCol: z.ZodNumber;
                    endLine: z.ZodNumber;
                    endCol: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                }, {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                }>>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }, {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }>, "many">>;
            extends: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            implements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "classifier";
            id: string;
            name: string;
            kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            attributes?: {
                name: string;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                typeRef?: any;
                static?: boolean | undefined;
                readonly?: boolean | undefined;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
            extends?: string[] | undefined;
            implements?: string[] | undefined;
        }, {
            type: "classifier";
            id: string;
            name: string;
            kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            attributes?: {
                name: string;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                typeRef?: any;
                static?: boolean | undefined;
                readonly?: boolean | undefined;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
            extends?: string[] | undefined;
            implements?: string[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodOptional<z.ZodNumber>;
                y: z.ZodOptional<z.ZodNumber>;
                w: z.ZodOptional<z.ZodNumber>;
                h: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }>>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        } & {
            type: z.ZodLiteral<"component">;
            ports: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                direction: z.ZodEnum<["provides", "requires"]>;
                interface: z.ZodOptional<z.ZodString>;
                doc: z.ZodOptional<z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    details: z.ZodOptional<z.ZodString>;
                    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                direction: "provides" | "requires";
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                interface?: string | undefined;
            }, {
                name: string;
                direction: "provides" | "requires";
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                interface?: string | undefined;
            }>, "many">>;
            contains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "component";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            ports?: {
                name: string;
                direction: "provides" | "requires";
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                interface?: string | undefined;
            }[] | undefined;
            contains?: string[] | undefined;
        }, {
            type: "component";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            ports?: {
                name: string;
                direction: "provides" | "requires";
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                interface?: string | undefined;
            }[] | undefined;
            contains?: string[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodOptional<z.ZodNumber>;
                y: z.ZodOptional<z.ZodNumber>;
                w: z.ZodOptional<z.ZodNumber>;
                h: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }>>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        } & {
            type: z.ZodLiteral<"interface">;
            operations: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                visibility: z.ZodOptional<z.ZodEnum<["public", "protected", "private", "package"]>>;
                params: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    typeRef: z.ZodType<any, z.ZodTypeDef, any>;
                    default: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
                    doc: z.ZodOptional<z.ZodObject<{
                        summary: z.ZodOptional<z.ZodString>;
                        details: z.ZodOptional<z.ZodString>;
                        examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    }, "strip", z.ZodTypeAny, {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    }, {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }, {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }>, "many">>;
                returns: z.ZodOptional<z.ZodType<any, z.ZodTypeDef, any>>;
                static: z.ZodOptional<z.ZodBoolean>;
                abstract: z.ZodOptional<z.ZodBoolean>;
                doc: z.ZodOptional<z.ZodObject<{
                    summary: z.ZodOptional<z.ZodString>;
                    details: z.ZodOptional<z.ZodString>;
                    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }, {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                }>>;
                tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                    namespace: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }, {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }>, "many">>;
                span: z.ZodOptional<z.ZodObject<{
                    startLine: z.ZodNumber;
                    startCol: z.ZodNumber;
                    endLine: z.ZodNumber;
                    endCol: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                }, {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                }>>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }, {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "interface";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
        }, {
            type: "interface";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            stereotypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
            doc: z.ZodOptional<z.ZodObject<{
                summary: z.ZodOptional<z.ZodString>;
                details: z.ZodOptional<z.ZodString>;
                examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }, {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            }>>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodOptional<z.ZodNumber>;
                y: z.ZodOptional<z.ZodNumber>;
                w: z.ZodOptional<z.ZodNumber>;
                h: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }, {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            }>>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        } & {
            type: z.ZodLiteral<"participant">;
            role: z.ZodOptional<z.ZodEnum<["actor", "boundary", "control", "entity", "service", "component", "database", "queue", "external"]>>;
            classifier: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "participant";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            classifier?: string | undefined;
            role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
        }, {
            type: "participant";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            classifier?: string | undefined;
            role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
        }>]>, "many">;
        relationships: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["association", "aggregation", "composition", "dependency", "realization", "generalization", "usecase-association", "include", "extend", "message"]>;
            from: z.ZodString;
            to: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
            fromMultiplicity: z.ZodOptional<z.ZodString>;
            toMultiplicity: z.ZodOptional<z.ZodString>;
            navigability: z.ZodOptional<z.ZodEnum<["none", "from-to", "to-from", "both"]>>;
            kind: z.ZodOptional<z.ZodEnum<["sync", "async", "reply", "create", "destroy"]>>;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
                namespace: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }, {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
            id: string;
            from: string;
            to: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
            label?: string | undefined;
            fromMultiplicity?: string | undefined;
            toMultiplicity?: string | undefined;
            navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
        }, {
            type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
            id: string;
            from: string;
            to: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
            label?: string | undefined;
            fromMultiplicity?: string | undefined;
            toMultiplicity?: string | undefined;
            navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
        }>, "many">;
        fragments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<["alt", "opt", "loop", "par", "break", "critical"]>;
            condition: z.ZodOptional<z.ZodString>;
            start: z.ZodNumber;
            end: z.ZodNumber;
            span: z.ZodOptional<z.ZodObject<{
                startLine: z.ZodNumber;
                startCol: z.ZodNumber;
                endLine: z.ZodNumber;
                endCol: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }, {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
            start: number;
            end: number;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            condition?: string | undefined;
        }, {
            kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
            start: number;
            end: number;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            condition?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        kind: "class" | "component" | "usecase" | "sequence";
        elements: ({
            type: "classifier";
            id: string;
            name: string;
            kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            attributes?: {
                name: string;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                typeRef?: any;
                static?: boolean | undefined;
                readonly?: boolean | undefined;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
            extends?: string[] | undefined;
            implements?: string[] | undefined;
        } | {
            type: "component";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            ports?: {
                name: string;
                direction: "provides" | "requires";
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                interface?: string | undefined;
            }[] | undefined;
            contains?: string[] | undefined;
        } | {
            type: "actor";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        } | {
            type: "usecase";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        } | {
            type: "interface";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
        } | {
            type: "participant";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            classifier?: string | undefined;
            role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
        })[];
        relationships: {
            type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
            id: string;
            from: string;
            to: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
            label?: string | undefined;
            fromMultiplicity?: string | undefined;
            toMultiplicity?: string | undefined;
            navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
        }[];
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        fragments?: {
            kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
            start: number;
            end: number;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            condition?: string | undefined;
        }[] | undefined;
    }, {
        id: string;
        name: string;
        kind: "class" | "component" | "usecase" | "sequence";
        elements: ({
            type: "classifier";
            id: string;
            name: string;
            kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            attributes?: {
                name: string;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                typeRef?: any;
                static?: boolean | undefined;
                readonly?: boolean | undefined;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
            extends?: string[] | undefined;
            implements?: string[] | undefined;
        } | {
            type: "component";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            ports?: {
                name: string;
                direction: "provides" | "requires";
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                interface?: string | undefined;
            }[] | undefined;
            contains?: string[] | undefined;
        } | {
            type: "actor";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        } | {
            type: "usecase";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        } | {
            type: "interface";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
        } | {
            type: "participant";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            classifier?: string | undefined;
            role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
        })[];
        relationships: {
            type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
            id: string;
            from: string;
            to: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
            label?: string | undefined;
            fromMultiplicity?: string | undefined;
            toMultiplicity?: string | undefined;
            navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
        }[];
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        fragments?: {
            kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
            start: number;
            end: number;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            condition?: string | undefined;
        }[] | undefined;
    }>, "many">;
    warnings: z.ZodOptional<z.ZodArray<z.ZodObject<{
        severity: z.ZodEnum<["info", "warning", "error"]>;
        code: z.ZodOptional<z.ZodString>;
        message: z.ZodString;
        path: z.ZodOptional<z.ZodString>;
        span: z.ZodOptional<z.ZodObject<{
            startLine: z.ZodNumber;
            startCol: z.ZodNumber;
            endLine: z.ZodNumber;
            endCol: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }, {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        severity: "info" | "warning" | "error";
        code?: string | undefined;
        path?: string | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
    }, {
        message: string;
        severity: "info" | "warning" | "error";
        code?: string | undefined;
        path?: string | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    version: "1.0.0";
    diagrams: {
        id: string;
        name: string;
        kind: "class" | "component" | "usecase" | "sequence";
        elements: ({
            type: "classifier";
            id: string;
            name: string;
            kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            attributes?: {
                name: string;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                typeRef?: any;
                static?: boolean | undefined;
                readonly?: boolean | undefined;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
            extends?: string[] | undefined;
            implements?: string[] | undefined;
        } | {
            type: "component";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            ports?: {
                name: string;
                direction: "provides" | "requires";
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                interface?: string | undefined;
            }[] | undefined;
            contains?: string[] | undefined;
        } | {
            type: "actor";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        } | {
            type: "usecase";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        } | {
            type: "interface";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
        } | {
            type: "participant";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            classifier?: string | undefined;
            role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
        })[];
        relationships: {
            type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
            id: string;
            from: string;
            to: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
            label?: string | undefined;
            fromMultiplicity?: string | undefined;
            toMultiplicity?: string | undefined;
            navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
        }[];
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        fragments?: {
            kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
            start: number;
            end: number;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            condition?: string | undefined;
        }[] | undefined;
    }[];
    source?: {
        kind?: "ascii-dsl" | "image" | "other" | undefined;
        uri?: string | undefined;
        text?: string | undefined;
        hash?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    warnings?: {
        message: string;
        severity: "info" | "warning" | "error";
        code?: string | undefined;
        path?: string | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
    }[] | undefined;
}, {
    version: "1.0.0";
    diagrams: {
        id: string;
        name: string;
        kind: "class" | "component" | "usecase" | "sequence";
        elements: ({
            type: "classifier";
            id: string;
            name: string;
            kind: "abstract" | "class" | "interface" | "enum" | "valueobject";
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            attributes?: {
                name: string;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                typeRef?: any;
                static?: boolean | undefined;
                readonly?: boolean | undefined;
                default?: string | number | boolean | null | undefined;
            }[] | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
            extends?: string[] | undefined;
            implements?: string[] | undefined;
        } | {
            type: "component";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            ports?: {
                name: string;
                direction: "provides" | "requires";
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                interface?: string | undefined;
            }[] | undefined;
            contains?: string[] | undefined;
        } | {
            type: "actor";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        } | {
            type: "usecase";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
        } | {
            type: "interface";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            operations?: {
                name: string;
                params?: {
                    name: string;
                    doc?: {
                        summary?: string | undefined;
                        details?: string | undefined;
                        examples?: string[] | undefined;
                    } | undefined;
                    typeRef?: any;
                    default?: string | number | boolean | null | undefined;
                }[] | undefined;
                span?: {
                    startLine: number;
                    startCol: number;
                    endLine: number;
                    endCol: number;
                } | undefined;
                tags?: {
                    value: string | number | boolean | null;
                    key: string;
                    namespace?: string | undefined;
                }[] | undefined;
                doc?: {
                    summary?: string | undefined;
                    details?: string | undefined;
                    examples?: string[] | undefined;
                } | undefined;
                visibility?: "public" | "protected" | "private" | "package" | undefined;
                static?: boolean | undefined;
                returns?: any;
                abstract?: boolean | undefined;
            }[] | undefined;
        } | {
            type: "participant";
            id: string;
            name: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            stereotypes?: string[] | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            doc?: {
                summary?: string | undefined;
                details?: string | undefined;
                examples?: string[] | undefined;
            } | undefined;
            position?: {
                x?: number | undefined;
                y?: number | undefined;
                w?: number | undefined;
                h?: number | undefined;
            } | undefined;
            classifier?: string | undefined;
            role?: "component" | "actor" | "boundary" | "control" | "entity" | "service" | "database" | "queue" | "external" | undefined;
        })[];
        relationships: {
            type: "message" | "association" | "aggregation" | "composition" | "dependency" | "realization" | "generalization" | "usecase-association" | "include" | "extend";
            id: string;
            from: string;
            to: string;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            tags?: {
                value: string | number | boolean | null;
                key: string;
                namespace?: string | undefined;
            }[] | undefined;
            kind?: "sync" | "async" | "reply" | "create" | "destroy" | undefined;
            label?: string | undefined;
            fromMultiplicity?: string | undefined;
            toMultiplicity?: string | undefined;
            navigability?: "none" | "from-to" | "to-from" | "both" | undefined;
        }[];
        doc?: {
            summary?: string | undefined;
            details?: string | undefined;
            examples?: string[] | undefined;
        } | undefined;
        fragments?: {
            kind: "alt" | "opt" | "loop" | "par" | "break" | "critical";
            start: number;
            end: number;
            span?: {
                startLine: number;
                startCol: number;
                endLine: number;
                endCol: number;
            } | undefined;
            condition?: string | undefined;
        }[] | undefined;
    }[];
    source?: {
        kind?: "ascii-dsl" | "image" | "other" | undefined;
        uri?: string | undefined;
        text?: string | undefined;
        hash?: string | undefined;
        createdAt?: string | undefined;
    } | undefined;
    warnings?: {
        message: string;
        severity: "info" | "warning" | "error";
        code?: string | undefined;
        path?: string | undefined;
        span?: {
            startLine: number;
            startCol: number;
            endLine: number;
            endCol: number;
        } | undefined;
    }[] | undefined;
}>;
export type DiagramIR = z.infer<typeof DiagramIRSchema>;
