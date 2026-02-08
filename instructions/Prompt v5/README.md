# DiagramIR (v1)

This folder contains the **contract** between:
1) Natural language → Diagram (generated or user-provided)
2) Diagram → Spec (authoritative backend spec)
3) Spec → Codegen

## Files

- `diagramir.schema.json` — **DiagramIR v1** JSON Schema (Draft-07)
- `ascii-dsl.grammar.md` — ASCII DSL grammar for **class** + **component** diagrams

## Recommended pipeline

1. **Ambiguous NL** → propose one or more diagrams (use-case for understanding, class for spec, component/sequence as needed)
2. **Validate** diagrams against `diagramir.schema.json`
3. **Enforce semantic rules** (see section 6 in `ascii-dsl.grammar.md`)
4. **Emit spec** from class diagram (primary), using other diagrams as constraints

## Versioning

- `DiagramIR.version` is fixed to `1.0.0` for this schema.
- If you need evolution: add `1.0.1` as a new schema file and keep older versions for backwards compatibility.
