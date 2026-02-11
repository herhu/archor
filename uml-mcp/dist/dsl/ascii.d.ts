import { DiagramIR } from "../schema/ir.js";
export declare class AsciiParser {
    private input;
    private diagnostics;
    constructor();
    parse(input: string): DiagramIR;
    private error;
    private tokenize;
    private parseDiagram;
}
