import { randomUUID } from "node:crypto";
// Simple ID generator
function generateId() {
    return "gen-" + randomUUID();
}
export class AsciiParser {
    input = "";
    diagnostics = [];
    constructor() { }
    parse(input) {
        this.input = input;
        this.diagnostics = [];
        // Naive one-pass parsing
        const tokens = this.tokenize(input);
        const diagram = this.parseDiagram(tokens);
        return {
            version: "1.0.0",
            source: {
                kind: "ascii-dsl",
                text: input
            },
            diagrams: [diagram],
            warnings: this.diagnostics.length > 0 ? this.diagnostics : undefined
        };
    }
    error(message, token) {
        if (token) {
            this.diagnostics.push({
                severity: "error",
                message: message,
                span: {
                    startLine: token.line, startCol: token.col,
                    endLine: token.line, endCol: token.col + token.value.length
                }
            });
        }
        else {
            this.diagnostics.push({ severity: "error", message });
        }
    }
    tokenize(input) {
        const tokens = [];
        let current = 0;
        let line = 1;
        let col = 1;
        // Add '->' to operators list explicitly
        const operators = ["-->", "->", "<--", "<-", "o--", "*--", "..>", "<..", "<|--", "--", ":", "{", "}", "(", ")", "[", "]", ",", "+", "-", "#"];
        while (current < input.length) {
            let char = input[current];
            if (char === ' ' || char === '\t') {
                current++;
                col++;
                continue;
            }
            if (char === '\n') {
                current++;
                line++;
                col = 1;
                tokens.push({ type: 'NEWLINE', value: '\n', line, col });
                continue;
            }
            if (char === '/' && input[current + 1] === '/') {
                // Comment
                while (char !== '\n' && current < input.length) {
                    char = input[++current];
                }
                continue;
            }
            if (char === '#') {
                // Comment
                while (char !== '\n' && current < input.length) {
                    char = input[++current];
                }
                continue;
            }
            if (char === '"') {
                let value = "";
                const startCol = col;
                char = input[++current]; // Skip open quote
                col++;
                while (char !== '"' && current < input.length) {
                    if (char === '\\') {
                        current++;
                        char = input[current];
                    }
                    value += char;
                    char = input[++current];
                    col++;
                }
                current++; // Skip close quote
                col++;
                tokens.push({ type: 'STRING', value, line, col: startCol });
                continue;
            }
            // Operators
            let matchedOp = "";
            for (const op of operators) {
                if (input.substr(current, op.length) === op) {
                    matchedOp = op;
                    break;
                }
            }
            if (matchedOp) {
                tokens.push({ type: 'OP', value: matchedOp, line, col });
                current += matchedOp.length;
                col += matchedOp.length;
                continue;
            }
            // Identifiers / Keywords
            const alphaNumeric = /[a-zA-Z0-9_\-.]/;
            if (alphaNumeric.test(char)) {
                let value = "";
                const startCol = col;
                while (current < input.length && alphaNumeric.test(input[current])) {
                    value += input[current];
                    current++;
                    col++;
                }
                tokens.push({ type: 'IDENT', value, line, col: startCol });
                continue;
            }
            current++;
            col++;
        }
        return tokens;
    }
    parseDiagram(tokens) {
        let currentTokenIndex = 0;
        const consume = () => {
            if (currentTokenIndex >= tokens.length)
                return null;
            return tokens[currentTokenIndex++];
        };
        const peek = (offset = 0) => {
            if (currentTokenIndex + offset >= tokens.length)
                return null;
            return tokens[currentTokenIndex + offset];
        };
        let diagramKind = "class";
        let diagramName = "Untitled";
        const elements = [];
        const relationships = [];
        const fragments = [];
        const activeFragments = []; // Stack for fragments
        // Main parsing loop
        while (currentTokenIndex < tokens.length) {
            const token = consume();
            if (!token)
                break;
            // Skip newlines
            if (token.type === 'NEWLINE')
                continue;
            try {
                // --- Class Parsing ---
                if (token.type === 'IDENT' && token.value === 'class') {
                    const nameToken = consume();
                    if (!nameToken || nameToken.type !== 'IDENT') {
                        this.error(`Expected class name`, token);
                        continue;
                    }
                    const clazz = {
                        id: nameToken.value,
                        type: "classifier",
                        kind: "class",
                        name: nameToken.value,
                        attributes: [],
                        operations: []
                    };
                    if (peek()?.value === 'as') {
                        consume();
                        const aliasToken = consume();
                        if (aliasToken)
                            clazz.id = aliasToken.value;
                    }
                    if (peek()?.value === '{') {
                        consume();
                        while (peek() && peek()?.value !== '}') {
                            const memberToken = consume();
                            if (!memberToken)
                                break;
                            if (memberToken.type === 'NEWLINE')
                                continue;
                            if (memberToken.type === 'IDENT' && peek()?.value === ':') {
                                consume();
                                const typeToken = consume();
                                clazz.attributes.push({
                                    name: memberToken.value,
                                    typeRef: { name: typeToken?.value || 'unknown' },
                                    visibility: "public"
                                });
                                while (peek() && peek()?.type !== 'NEWLINE' && peek()?.value !== '}') {
                                    consume();
                                }
                            }
                            else if (memberToken.type === 'OP' && (memberToken.value === '+' || memberToken.value === '-')) {
                                const visibility = memberToken.value === '+' ? 'public' : 'private';
                                const nameT = consume();
                                if (peek()?.value === '(') {
                                    clazz.operations.push({ name: nameT?.value, visibility });
                                }
                                else {
                                    clazz.attributes.push({ name: nameT?.value, visibility, typeRef: { name: 'unknown' } });
                                }
                                while (peek() && peek()?.type !== 'NEWLINE' && peek()?.value !== '}') {
                                    if (peek()?.value === ':') {
                                        consume(); // type sep
                                        const typeT = consume(); // type
                                        if (typeT && clazz.attributes.length > 0) {
                                            // simplified
                                        }
                                    }
                                    else {
                                        consume();
                                    }
                                }
                            }
                        }
                        if (peek()?.value === '}')
                            consume();
                    }
                    elements.push(clazz);
                }
                // --- Component Parsing ---
                else if (token.type === 'IDENT' && token.value === 'component') {
                    diagramKind = "component";
                    let name = "Unnamed";
                    let id = "";
                    if (peek()?.type === 'STRING') {
                        name = consume()?.value || "Unnamed";
                        id = name.replace(/\s+/g, '_');
                    }
                    else if (peek()?.type === 'IDENT') {
                        name = consume()?.value || "Unnamed";
                        id = name;
                    }
                    if (peek()?.value === 'as') {
                        consume();
                        const aliasToken = consume();
                        if (aliasToken)
                            id = aliasToken.value;
                    }
                    const comp = {
                        id,
                        type: "component",
                        name,
                        ports: [],
                        contains: []
                    };
                    if (peek()?.value === '{') {
                        consume();
                        while (peek() && peek()?.value !== '}') {
                            const portToken = consume();
                            if (!portToken)
                                break;
                            if (portToken.type === 'NEWLINE')
                                continue;
                            if (portToken.value === 'provides' || portToken.value === 'requires') {
                                const dir = portToken.value;
                                const pname = consume()?.value || "p";
                                let ifaceId = undefined;
                                if (peek()?.value === ':') {
                                    consume();
                                    ifaceId = consume()?.value;
                                }
                                comp.ports.push({ name: pname, direction: dir, interface: ifaceId });
                            }
                            while (peek() && peek()?.type !== 'NEWLINE' && peek()?.value !== '}')
                                consume();
                        }
                        if (peek()?.value === '}')
                            consume();
                    }
                    elements.push(comp);
                }
                // --- Use Case Parsing ---
                else if (token.type === 'IDENT' && token.value === 'actor') {
                    diagramKind = "usecase";
                    const nameToken = consume();
                    if (!nameToken) {
                        this.error("Expected name", token);
                        continue;
                    }
                    const name = nameToken.value;
                    const id = name.replace(/\s+/g, '_');
                    elements.push({ id, type: 'actor', name });
                }
                else if (token.type === 'IDENT' && token.value === 'usecase') {
                    diagramKind = "usecase";
                    const nameToken = consume();
                    if (!nameToken) {
                        this.error("Expected name", token);
                        continue;
                    }
                    const name = nameToken.value;
                    const id = name.replace(/\s+/g, '_');
                    elements.push({ id, type: 'usecase', name });
                }
                // --- Sequence Parsing ---
                else if (token.type === 'IDENT' && token.value === 'participant') {
                    diagramKind = "sequence";
                    const nameToken = consume();
                    const name = nameToken?.value || "Unknown";
                    let id = name.replace(/\s+/g, '_');
                    if (peek()?.value === 'as') {
                        consume();
                        id = consume()?.value || id;
                    }
                    elements.push({ id, type: "participant", name, role: "component" });
                }
                else if (token.type === 'IDENT' && ["alt", "opt", "loop", "par", "break", "critical"].includes(token.value)) {
                    diagramKind = "sequence";
                    const kind = token.value;
                    let condition = "";
                    if (peek()?.type === 'STRING' || peek()?.type === 'IDENT') {
                        condition = consume()?.value || "";
                    }
                    const startLine = token.line;
                    // Handle block
                    if (peek()?.value === '{') {
                        consume();
                    }
                    // Push to stack
                    activeFragments.push({ kind, condition, start: startLine, end: startLine }); // end updated later
                }
                else if (token.type === 'OP' && token.value === '}') {
                    // Closing a block. If we have active fragments, pop one.
                    if (activeFragments.length > 0) {
                        const frag = activeFragments.pop();
                        frag.end = token.line;
                        fragments.push(frag);
                    }
                }
                // --- Relationships ---
                else if (token.type === 'IDENT' || token.type === 'STRING') {
                    // Potential start of relationship
                    const fromId = token.type === 'STRING' ? token.value.replace(/\s+/g, '_') : token.value;
                    if (peek()?.type === 'OP' && (peek()?.value.includes('--') || peek()?.value.includes('->') || peek()?.value.includes('..>'))) {
                        const opToken = consume();
                        const targetToken = consume();
                        if (targetToken) {
                            const toId = targetToken.type === 'STRING' ? targetToken.value.replace(/\s+/g, '_') : targetToken.value;
                            let type = "association";
                            let kind = "sync";
                            if (opToken?.value.includes('..>'))
                                type = "dependency";
                            if (opToken?.value === '-->') {
                                type = "message";
                                kind = "reply";
                            }
                            if (opToken?.value === '->') {
                                type = "message";
                                kind = "sync";
                            }
                            const rel = {
                                id: generateId(),
                                from: fromId, to: toId, type, label: ""
                            };
                            if (type === 'message') {
                                rel.kind = kind;
                                diagramKind = "sequence";
                            }
                            if (peek()?.value === ':') {
                                consume();
                                let label = "";
                                while (peek() && peek()?.type !== 'NEWLINE' && peek()?.type !== 'OP') {
                                    if (peek()?.value === '{')
                                        break;
                                    label += consume()?.value + " ";
                                }
                                rel.label = label.trim();
                            }
                            relationships.push(rel);
                        }
                    }
                }
            }
            catch (e) {
                this.error(`Parsing error: ${e.message}`, token);
                // Skip to next line to recover (consuming until Newline)
                while (peek() && peek()?.type !== 'NEWLINE')
                    consume();
            }
        }
        // Process any unclosed fragments
        while (activeFragments.length > 0) {
            const frag = activeFragments.pop();
            this.error(`Unclosed fragment ${frag.kind} starting at line ${frag.start}`, null);
            fragments.push(frag);
        }
        return {
            id: generateId(),
            kind: diagramKind,
            name: diagramName,
            elements,
            relationships,
            fragments: fragments.length > 0 ? fragments : undefined
        };
    }
}
