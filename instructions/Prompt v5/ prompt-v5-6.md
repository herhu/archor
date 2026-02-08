Below is a **reference implementation outline (TypeScript)** for:

- `parseAsciiToAst()` (peggy)
- `validateAst()` (AJV)
- `astToDiagramIr()` (pure mapping)
- `resolveSymbols()` (name resolution + fixup)
- `validateDiagramIr()` (AJV)
- `semanticValidateIr()` (rules)
- A clean **MCP error object schema + return shape** (designed for UX + tooling)

Everything is deterministic and structured for an MCP tool implementation.

---

## 1) Project layout

```
uml-mcp/
  src/
    dsl/
      class-component.peggy
      ast-schema.json
      parser.ts
    ir/
      diagram-ir-schema.json
      ast-to-ir.ts
      resolver.ts
      semantic.ts
    mcp/
      tools.ts
      errors.ts
  package.json
```

---

## 2) Error object schema (what every tool returns)

You want a consistent diagnostic format across parse/validate/resolve.

### `diagnostics.schema.json` (draft-07)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://10kgoal.dev/schemas/uml-diagnostics-v1.schema.json",
  "title": "UML MCP Diagnostics v1",
  "type": "object",
  "additionalProperties": false,
  "required": ["ok", "diagnostics"],
  "properties": {
    "ok": { "type": "boolean" },
    "result": {},
    "diagnostics": {
      "type": "array",
      "items": { "$ref": "#/definitions/Diagnostic" }
    }
  },
  "definitions": {
    "Diagnostic": {
      "type": "object",
      "additionalProperties": false,
      "required": ["severity", "code", "message"],
      "properties": {
        "severity": {
          "type": "string",
          "enum": ["error", "warning", "info"]
        },
        "code": {
          "type": "string",
          "minLength": 1,
          "description": "Stable machine-readable code, e.g., PARSE_SYNTAX, AST_SCHEMA, IR_UNRESOLVED_TYPE."
        },
        "message": { "type": "string", "minLength": 1 },
        "path": {
          "type": "string",
          "description": "JSON pointer-like path to the failing node, e.g., /statements/3/members/1"
        },
        "location": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "line": { "type": "integer", "minimum": 1 },
            "column": { "type": "integer", "minimum": 1 },
            "endLine": { "type": "integer", "minimum": 1 },
            "endColumn": { "type": "integer", "minimum": 1 }
          }
        },
        "hint": { "type": "string" },
        "related": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["message"],
            "properties": {
              "message": { "type": "string" },
              "path": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

### Tool return shape (recommended)

Every tool returns:

```ts
type ToolResponse<T> = {
  ok: boolean;
  result?: T;
  diagnostics: Diagnostic[];
};
```

---

## 3) `parseAsciiToAst()` + AJV AST validation

### `src/dsl/parser.ts`

```ts
import fs from "node:fs";
import path from "node:path";
import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import peggy from "peggy";

export type Diagnostic = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  location?: {
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
  };
  hint?: string;
  related?: Array<{ message: string; path?: string }>;
};

export type ToolResponse<T> = {
  ok: boolean;
  result?: T;
  diagnostics: Diagnostic[];
};

export type DslKind = "class" | "component";

export type AstRoot = {
  version: "1.0.0";
  kind: DslKind;
  statements: any[];
};

function ajvErrorsToDiagnostics(
  code: string,
  errors: ErrorObject[] | null | undefined,
): Diagnostic[] {
  if (!errors?.length) return [];
  return errors.map((e) => ({
    severity: "error",
    code,
    message: `${e.instancePath || "/"} ${e.message || "is invalid"}`,
    path: e.instancePath || "/",
    hint: e.params ? JSON.stringify(e.params) : undefined,
  }));
}

function peggyErrorToDiagnostic(err: any): Diagnostic {
  // peggy syntax errors usually include `location`
  const loc = err.location
    ? {
        line: err.location.start?.line,
        column: err.location.start?.column,
        endLine: err.location.end?.line,
        endColumn: err.location.end?.column,
      }
    : undefined;

  return {
    severity: "error",
    code: "PARSE_SYNTAX",
    message: err.message || "Syntax error",
    location: loc,
    hint: "Check keywords, braces {}, and statement formats.",
  };
}

export class AsciiDslParser {
  private parseClass: (input: string) => AstRoot;
  private parseComponent: (input: string) => AstRoot;

  private validateAst: (data: unknown) => boolean;
  private ajv: Ajv;

  constructor(opts: { grammarPath: string; astSchemaPath: string }) {
    const grammarText = fs.readFileSync(opts.grammarPath, "utf8");
    const parser = peggy.generate(grammarText);

    // The grammar exports StartClass and StartComponent entry rules
    this.parseClass = (input) =>
      parser.parse(input, { startRule: "StartClass" });
    this.parseComponent = (input) =>
      parser.parse(input, { startRule: "StartComponent" });

    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);

    const astSchema = JSON.parse(fs.readFileSync(opts.astSchemaPath, "utf8"));
    this.validateAst = this.ajv.compile(astSchema);
  }

  parseAsciiToAst(kind: DslKind, input: string): ToolResponse<AstRoot> {
    const diagnostics: Diagnostic[] = [];

    let ast: AstRoot | undefined;
    try {
      ast =
        kind === "class" ? this.parseClass(input) : this.parseComponent(input);
    } catch (err: any) {
      diagnostics.push(peggyErrorToDiagnostic(err));
      return { ok: false, diagnostics };
    }

    const ok = this.validateAst(ast);
    if (!ok) {
      diagnostics.push(
        ...ajvErrorsToDiagnostics("AST_SCHEMA", this.validateAst.errors),
      );
      return { ok: false, diagnostics };
    }

    return { ok: true, result: ast, diagnostics };
  }
}
```

---

## 4) AST → DiagramIR (pure mapping)

### Types you’ll want

```ts
export type DiagramIr = {
  version: "1.0.0";
  meta: {
    projectName: string;
    source: {
      kind: "ascii" | "image" | "nl" | "import" | "mixed";
      artifactId?: string;
      notes?: string;
    };
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    description?: string;
    authors?: string[];
  };
  diagrams: any;
};

export type LossinessItem = {
  severity: "warning" | "info";
  code: string;
  message: string;
  path?: string;
};
```

### `src/ir/ast-to-ir.ts`

```ts
import type { AstRoot } from "../dsl/parser";

export type Diagnostic = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  hint?: string;
};

export type ToolResponse<T> = {
  ok: boolean;
  result?: T;
  diagnostics: Diagnostic[];
};

function joinNotes(a?: string, b?: string) {
  const aa = (a || "").trim();
  const bb = (b || "").trim();
  if (!aa) return bb;
  if (!bb) return aa;
  return `${aa}\n\n${bb}`;
}

function displayName(id: string, maybe?: string | null) {
  return maybe ?? id;
}

export type DiagramIr = any; // use your DiagramIR v1 type

export function astToDiagramIr(
  ast: AstRoot,
  meta: { projectName: string; sourceArtifactId?: string },
): ToolResponse<DiagramIr> {
  const diagnostics: Diagnostic[] = [];
  const ir: any = {
    version: "1.0.0",
    meta: {
      projectName: meta.projectName,
      source: { kind: "ascii", artifactId: meta.sourceArtifactId },
    },
    diagrams: {},
  };

  if (ast.kind === "class") {
    const out = {
      packages: [] as any[],
      types: [] as any[],
      enums: [] as any[],
      relations: [] as any[],
      notes: "",
    };
    const packages: Map<string, any> = new Map();

    // helper: ensure package
    const ensurePkg = (id: string, dn?: string | null) => {
      if (!packages.has(id)) {
        const p = { id, name: displayName(id, dn), elements: [] as any[] };
        packages.set(id, p);
        out.packages.push(p);
      }
      return packages.get(id)!;
    };

    // implicit package fallback
    const defaultPkg = () => ensurePkg("default", meta.projectName);

    const mapTypeExpr = (t: any, ctxPath: string): any => {
      switch (t.kind) {
        case "prim":
          if (t.name === "void") return null;
          // Map to DiagramIR PrimitiveTypeRef
          return { kind: "primitive", name: t.name };
        case "decimal":
          // TypeRef has no precision/scale in DiagramIR v1 (precision/scale live on Attribute)
          // Represent as primitive decimal; capture lossiness in diagnostics if used in aliases.
          return { kind: "primitive", name: "decimal" };
        case "named":
          // Two-phase: placeholder kind; resolver will fix.
          return {
            kind: "named",
            ref: { kind: "typeAlias", id: t.name.split(".").pop() },
          };
        case "array":
          return {
            kind: "collection",
            collection: "array",
            of: mapTypeExpr(t.of, ctxPath + "/of"),
          };
        case "set":
          return {
            kind: "collection",
            collection: "set",
            of: mapTypeExpr(t.of, ctxPath + "/of"),
          };
        case "map":
          return {
            kind: "collection",
            collection: "map",
            keyType: mapTypeExpr(t.key, ctxPath + "/key"),
            of: mapTypeExpr(t.value, ctxPath + "/value"),
          };
        default:
          diagnostics.push({
            severity: "error",
            code: "AST_TYPE_UNKNOWN",
            message: `Unknown type kind: ${t.kind}`,
            path: ctxPath,
          });
          return { kind: "primitive", name: "string" };
      }
    };

    const mapAttributeMods = (
      mods: any,
      attrTypeRef: any,
      attr: any,
      path: string,
    ) => {
      if (mods.pk) attr.primaryKey = true;
      if (mods.unique) attr.unique = true;
      if (mods.nullable) attr.nullable = true;
      if (mods.generated) attr.generated = mods.generated;
      if (mods.default !== undefined) attr.default = mods.default;

      if (mods.length !== undefined) attr.length = mods.length;
      if (mods.precision !== undefined) attr.precision = mods.precision;
      if (mods.scale !== undefined) attr.scale = mods.scale;

      if (mods.desc) attr.description = mods.desc;
      if (mods.tags) attr.tags = mods.tags;

      if (mods.format) {
        if (attrTypeRef?.kind === "primitive") {
          attrTypeRef.format = mods.format;
        } else {
          diagnostics.push({
            severity: "warning",
            code: "FORMAT_NON_PRIMITIVE",
            message: `format(${mods.format}) ignored for non-primitive attribute type`,
            path,
          });
        }
      }
    };

    const handleStatements = (stmts: any[], pkgId?: string) => {
      for (let i = 0; i < stmts.length; i++) {
        const s = stmts[i];
        const stmtPath = `/statements/${i}`;
        const pkg = pkgId ? ensurePkg(pkgId) : null;

        switch (s.type) {
          case "package": {
            const p = ensurePkg(s.id, s.displayName);
            handleStatements(s.body || [], s.id);
            break;
          }
          case "note": {
            out.notes = joinNotes(out.notes, s.text);
            break;
          }
          case "tags": {
            ir.meta.tags = Array.from(
              new Set([...(ir.meta.tags || []), ...(s.tags || [])]),
            );
            break;
          }
          case "enum": {
            const e = {
              kind: "enum",
              id: s.id,
              name: displayName(s.id, s.displayName),
              values: (s.values || []).map((v: any) => ({
                id: v.id,
                name: v.id,
                ...(v.description ? { description: v.description } : {}),
              })),
            };
            (pkg ? pkg.elements : defaultPkg().elements).push(e);
            break;
          }
          case "typeAlias": {
            const target = mapTypeExpr(s.target, stmtPath + "/target");
            if (s.target?.kind === "decimal") {
              diagnostics.push({
                severity: "info",
                code: "DECIMAL_ALIAS_LOSSY",
                message:
                  "decimal(p,s) precision/scale for TYPE alias is not represented in DiagramIR TypeRef; keep via conventions/tags.",
                path: stmtPath,
              });
            }
            const ta = {
              kind: "typeAlias",
              id: s.id,
              name: displayName(s.id, s.displayName),
              target,
            };
            (pkg ? pkg.elements : defaultPkg().elements).push(ta);
            break;
          }
          case "class": {
            const c: any = {
              kind: "class",
              id: s.id,
              name: displayName(s.id, s.displayName),
              attributes: [],
              operations: [],
            };
            if (s.abstract) c.abstract = true;
            if (s.stereotypes?.length) c.stereotypes = s.stereotypes;

            let desc = "";
            let tags: string[] | undefined;

            for (let mi = 0; mi < (s.members || []).length; mi++) {
              const m = s.members[mi];
              const memPath = `${stmtPath}/members/${mi}`;

              if (m.type === "attribute") {
                const tRef = mapTypeExpr(m.valueType, memPath + "/valueType");
                const attr: any = { name: m.name, type: tRef };
                mapAttributeMods(m.mods || {}, tRef, attr, memPath);

                // apply decimal(p,s) on attribute if the typeExpr was decimal
                if (m.valueType?.kind === "decimal") {
                  if (m.valueType.precision !== undefined)
                    attr.precision = m.valueType.precision;
                  if (m.valueType.scale !== undefined)
                    attr.scale = m.valueType.scale;
                }

                c.attributes.push(attr);
              } else if (m.type === "operation") {
                const op: any = { name: m.name, params: [] as any[] };
                for (const p of m.params || []) {
                  op.params.push({
                    name: p.name,
                    type: mapTypeExpr(p.valueType, memPath + "/params"),
                    ...(p.optional ? { optional: true } : {}),
                  });
                }
                if (m.returns) {
                  const rt = mapTypeExpr(m.returns, memPath + "/returns");
                  if (rt) op.returns = rt; // omit void
                }
                if (m.desc) op.description = m.desc;
                if (m.tags?.length) op.tags = m.tags;
                c.operations.push(op);
              } else if (m.type === "note") {
                desc = joinNotes(desc, m.text);
              } else if (m.type === "tags") {
                tags = Array.from(
                  new Set([...(tags || []), ...(m.tags || [])]),
                );
              }
            }

            if (desc) c.description = desc;
            if (tags?.length) c.tags = tags;

            (pkg ? pkg.elements : defaultPkg().elements).push(c);
            break;
          }
          case "interface": {
            const itf: any = {
              kind: "interface",
              id: s.id,
              name: displayName(s.id, s.displayName),
              operations: [],
            };

            let desc = "";
            let tags: string[] | undefined;

            for (let mi = 0; mi < (s.members || []).length; mi++) {
              const m = s.members[mi];
              const memPath = `${stmtPath}/members/${mi}`;

              if (m.type === "operation") {
                const op: any = { name: m.name, params: [] as any[] };
                for (const p of m.params || []) {
                  op.params.push({
                    name: p.name,
                    type: mapTypeExpr(p.valueType, memPath + "/params"),
                    ...(p.optional ? { optional: true } : {}),
                  });
                }
                if (m.returns) {
                  const rt = mapTypeExpr(m.returns, memPath + "/returns");
                  if (rt) op.returns = rt;
                }
                if (m.desc) op.description = m.desc;
                if (m.tags?.length) op.tags = m.tags;
                itf.operations.push(op);
              } else if (m.type === "note") {
                desc = joinNotes(desc, m.text);
              } else if (m.type === "tags") {
                tags = Array.from(
                  new Set([...(tags || []), ...(m.tags || [])]),
                );
              }
            }

            if (desc) itf.description = desc;
            if (tags?.length) itf.tags = tags;

            (pkg ? pkg.elements : defaultPkg().elements).push(itf);
            break;
          }
          case "relation": {
            const typeMap: Record<string, string> = {
              assoc: "association",
              agg: "aggregation",
              comp: "composition",
              inherit: "inheritance",
              impl: "implementation",
              dep: "dependency",
            };

            const nav = s.nav || "bi";
            const leftNav = nav === "lr" || nav === "bi";
            const rightNav = nav === "rl" || nav === "bi";

            const rel: any = {
              type: typeMap[s.relKind] || "association",
              from: {
                classId: s.left.classId,
                ...(s.left.role ? { role: s.left.role } : {}),
                ...(s.left.card ? { cardinality: s.left.card } : {}),
                navigable: leftNav,
              },
              to: {
                classId: s.right.classId,
                ...(s.right.role ? { role: s.right.role } : {}),
                ...(s.right.card ? { cardinality: s.right.card } : {}),
                navigable: rightNav,
              },
            };

            if (s.name) rel.name = s.name;
            if (s.desc) rel.description = s.desc;

            out.relations.push(rel);
            break;
          }
          default:
            // import is ignored at diagram level
            break;
        }
      }
    };

    handleStatements(ast.statements);

    // enforce at least one package
    if (!out.packages.length) defaultPkg();
    ir.diagrams.classModel = out;
  }

  if (ast.kind === "component") {
    const out: any = { components: [], links: [], notes: "" };

    for (let i = 0; i < ast.statements.length; i++) {
      const s = ast.statements[i];
      const stmtPath = `/statements/${i}`;

      switch (s.type) {
        case "note":
          out.notes = joinNotes(out.notes, s.text);
          break;
        case "tags":
          ir.meta.tags = Array.from(
            new Set([...(ir.meta.tags || []), ...(s.tags || [])]),
          );
          break;
        case "component": {
          const c: any = {
            id: s.id,
            name: displayName(s.id, s.displayName),
            type: s.compType,
          };
          if (s.tech)
            c.tech = {
              name: s.tech.name,
              ...(s.tech.version ? { version: s.tech.version } : {}),
            };
          if (s.caps?.length) c.capabilities = s.caps;
          if (s.stereotypes?.length) c.stereotypes = s.stereotypes;
          if (s.tags?.length) c.tags = s.tags;
          if (s.desc) c.description = s.desc;
          out.components.push(c);
          break;
        }
        case "link": {
          const l: any = { from: s.from, to: s.to };
          if (s.via) l.type = s.via;
          if (s.dir) l.direction = s.dir;
          if (s.label) l.label = s.label;
          if (s.desc) l.description = s.desc;
          out.links.push(l);
          break;
        }
        default:
          // import ignored or stored in meta.source.notes if you want
          break;
      }
    }

    ir.diagrams.component = out;
  }

  const ok = diagnostics.every((d) => d.severity !== "error");
  return ok
    ? { ok: true, result: ir, diagnostics }
    : { ok: false, diagnostics };
}
```

---

## 5) Symbol resolution (`resolveSymbols()`) for named types

This is the step that turns placeholder `NamedTypeRef.ref.kind="typeAlias"` into the real kind.

### `src/ir/resolver.ts`

```ts
export type Diagnostic = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  hint?: string;
};

export type ToolResponse<T> = {
  ok: boolean;
  result?: T;
  diagnostics: Diagnostic[];
};

type SymbolKind = "typeAlias" | "enum" | "class" | "interface";

type SymbolEntry = {
  kind: SymbolKind;
  id: string; // unqualified id
  fqid: string; // package.id + "." + id
  packageId: string;
};

function buildSymbolTables(classModel: any) {
  const symbolsByFqid = new Map<string, SymbolEntry>();
  const symbolsById = new Map<string, SymbolEntry[]>();

  for (const pkg of classModel.packages || []) {
    for (const el of pkg.elements || []) {
      const kind = el.kind as SymbolKind;
      if (!["typeAlias", "enum", "class", "interface"].includes(kind)) continue;

      const id = el.id;
      const fqid = `${pkg.id}.${id}`;
      const entry: SymbolEntry = { kind, id, fqid, packageId: pkg.id };

      symbolsByFqid.set(fqid, entry);

      const arr = symbolsById.get(id) || [];
      arr.push(entry);
      symbolsById.set(id, arr);
    }
  }

  return { symbolsByFqid, symbolsById };
}

function chooseBest(entries: SymbolEntry[]): SymbolEntry | null {
  if (entries.length === 1) return entries[0];

  // precedence: typeAlias > enum > class > interface
  const rank: Record<SymbolKind, number> = {
    typeAlias: 1,
    enum: 2,
    class: 3,
    interface: 4,
  };
  const sorted = [...entries].sort((a, b) => rank[a.kind] - rank[b.kind]);

  // if best is unique in rank, choose it; else ambiguous
  const bestRank = rank[sorted[0].kind];
  const tied = sorted.filter((e) => rank[e.kind] === bestRank);
  if (tied.length === 1) return tied[0];
  return null;
}

function resolveName(
  name: string,
  tables: ReturnType<typeof buildSymbolTables>,
): { entry?: SymbolEntry; ambiguous?: boolean } {
  // qualified?
  if (name.includes(".")) {
    const entry = tables.symbolsByFqid.get(name);
    return entry ? { entry } : {};
  }

  const entries = tables.symbolsById.get(name);
  if (!entries?.length) return {};
  const best = chooseBest(entries);
  if (!best) return { ambiguous: true };
  return { entry: best };
}

export function resolveSymbols(ir: any): ToolResponse<any> {
  const diagnostics: Diagnostic[] = [];
  const cm = ir.diagrams?.classModel;
  if (!cm) return { ok: true, result: ir, diagnostics };

  const tables = buildSymbolTables(cm);

  function walkTypeRef(typeRef: any, path: string) {
    if (!typeRef) return;

    if (typeRef.kind === "named") {
      // placeholder: typeRef.ref.id currently set to last segment
      const id = typeRef.ref?.id;
      if (!id) return;

      // we also need the original qualified name. If you want perfect resolution,
      // store original in AST->IR as `ref.original`, but if not, we can only resolve by id.
      const resolved = resolveName(id, tables);

      if (!resolved.entry) {
        diagnostics.push({
          severity: "error",
          code: "IR_UNRESOLVED_TYPE",
          message: `Unresolved named type: ${id}`,
          path,
        });
        return;
      }
      if (resolved.ambiguous) {
        diagnostics.push({
          severity: "error",
          code: "IR_AMBIGUOUS_TYPE",
          message: `Ambiguous named type: ${id}. Use qualified name Package.${id}.`,
          path,
        });
        return;
      }

      typeRef.ref.kind = resolved.entry.kind;
      typeRef.ref.id = resolved.entry.id; // keep unqualified id (your DiagramIR uses id)
      return;
    }

    if (typeRef.kind === "collection") {
      walkTypeRef(typeRef.keyType, path + "/keyType");
      walkTypeRef(typeRef.of, path + "/of");
    }
  }

  // Walk attributes + operations
  for (let pi = 0; pi < (cm.packages || []).length; pi++) {
    const pkg = cm.packages[pi];
    for (let ei = 0; ei < (pkg.elements || []).length; ei++) {
      const el = pkg.elements[ei];
      if (el.kind === "class") {
        for (let ai = 0; ai < (el.attributes || []).length; ai++) {
          walkTypeRef(
            el.attributes[ai].type,
            `/diagrams/classModel/packages/${pi}/elements/${ei}/attributes/${ai}/type`,
          );
        }
        for (let oi = 0; oi < (el.operations || []).length; oi++) {
          for (let pj = 0; pj < (el.operations[oi].params || []).length; pj++) {
            walkTypeRef(
              el.operations[oi].params[pj].type,
              `/diagrams/classModel/packages/${pi}/elements/${ei}/operations/${oi}/params/${pj}/type`,
            );
          }
          walkTypeRef(
            el.operations[oi].returns,
            `/diagrams/classModel/packages/${pi}/elements/${ei}/operations/${oi}/returns`,
          );
        }
      } else if (el.kind === "interface") {
        for (let oi = 0; oi < (el.operations || []).length; oi++) {
          for (let pj = 0; pj < (el.operations[oi].params || []).length; pj++) {
            walkTypeRef(
              el.operations[oi].params[pj].type,
              `/diagrams/classModel/packages/${pi}/elements/${ei}/operations/${oi}/params/${pj}/type`,
            );
          }
          walkTypeRef(
            el.operations[oi].returns,
            `/diagrams/classModel/packages/${pi}/elements/${ei}/operations/${oi}/returns`,
          );
        }
      } else if (el.kind === "typeAlias") {
        // target can be named/collection/primitive; walk it too
        walkTypeRef(
          el.target,
          `/diagrams/classModel/packages/${pi}/elements/${ei}/target`,
        );
      }
    }
  }

  const ok = diagnostics.every((d) => d.severity !== "error");
  return ok
    ? { ok: true, result: ir, diagnostics }
    : { ok: false, diagnostics };
}
```

**Strong suggestion**: during AST→IR, keep `originalQualifiedName` somewhere if you want exact package resolution. E.g. add:

```ts
typeRef.ref.original = "billing.InvoiceStatus";
```

Even if it’s not in schema, you can keep it temporarily and strip it after resolution.

---

## 6) Semantic validation (`semanticValidateIr()`)

### `src/ir/semantic.ts`

```ts
export type Diagnostic = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  hint?: string;
};

export type ToolResponse<T> = {
  ok: boolean;
  result?: T;
  diagnostics: Diagnostic[];
};

export function semanticValidateIr(ir: any): ToolResponse<null> {
  const diagnostics: Diagnostic[] = [];

  // --- Class model semantic checks ---
  const cm = ir.diagrams?.classModel;
  if (cm) {
    const classes = new Set<string>();
    const interfaces = new Set<string>();
    const enums = new Set<string>();
    const aliases = new Set<string>();

    // global uniqueness across packages (recommended)
    const seen = new Map<string, string>(); // id -> kind

    for (let pi = 0; pi < (cm.packages || []).length; pi++) {
      const pkg = cm.packages[pi];
      for (let ei = 0; ei < (pkg.elements || []).length; ei++) {
        const el = pkg.elements[ei];
        const id = el.id;

        if (seen.has(id)) {
          diagnostics.push({
            severity: "error",
            code: "DUPLICATE_ID",
            message: `Duplicate element id '${id}' (already used by ${seen.get(id)})`,
            path: `/diagrams/classModel/packages/${pi}/elements/${ei}`,
          });
        } else {
          seen.set(id, el.kind);
        }

        if (el.kind === "class") classes.add(id);
        if (el.kind === "interface") interfaces.add(id);
        if (el.kind === "enum") enums.add(id);
        if (el.kind === "typeAlias") aliases.add(id);

        // PK checks
        if (el.kind === "class") {
          const pkAttrs = (el.attributes || []).filter(
            (a: any) => a.primaryKey,
          );
          if (pkAttrs.length === 0) {
            diagnostics.push({
              severity: "warning",
              code: "NO_PRIMARY_KEY",
              message: `Class '${id}' has no primary key attribute.`,
              path: `/diagrams/classModel/packages/${pi}/elements/${ei}`,
            });
          } else if (pkAttrs.length > 1) {
            diagnostics.push({
              severity: "error",
              code: "MULTIPLE_PRIMARY_KEYS",
              message: `Class '${id}' has multiple primary key attributes (composite PK not supported unless you add it).`,
              path: `/diagrams/classModel/packages/${pi}/elements/${ei}`,
            });
          }

          // generated implies pk
          for (let ai = 0; ai < (el.attributes || []).length; ai++) {
            const a = el.attributes[ai];
            if (a.generated && a.generated !== "none" && !a.primaryKey) {
              diagnostics.push({
                severity: "warning",
                code: "GENERATED_NOT_PK",
                message: `Attribute '${id}.${a.name}' is generated(${a.generated}) but not marked pk.`,
                path: `/diagrams/classModel/packages/${pi}/elements/${ei}/attributes/${ai}`,
              });
            }

            // precision/scale requires decimal
            if (
              (a.precision !== undefined || a.scale !== undefined) &&
              a.type?.kind === "primitive" &&
              a.type?.name !== "decimal"
            ) {
              diagnostics.push({
                severity: "warning",
                code: "PRECISION_NON_DECIMAL",
                message: `Attribute '${id}.${a.name}' has precision/scale but type is not decimal.`,
                path: `/diagrams/classModel/packages/${pi}/elements/${ei}/attributes/${ai}`,
              });
            }
          }
        }
      }
    }

    // relations reference existing things
    for (let ri = 0; ri < (cm.relations || []).length; ri++) {
      const r = cm.relations[ri];
      const from = r.from?.classId;
      const to = r.to?.classId;

      const existsFrom = classes.has(from) || interfaces.has(from);
      const existsTo = classes.has(to) || interfaces.has(to);

      if (!existsFrom) {
        diagnostics.push({
          severity: "error",
          code: "REL_UNKNOWN_CLASS",
          message: `Relation 'from' references unknown type '${from}'.`,
          path: `/diagrams/classModel/relations/${ri}/from`,
        });
      }
      if (!existsTo) {
        diagnostics.push({
          severity: "error",
          code: "REL_UNKNOWN_CLASS",
          message: `Relation 'to' references unknown type '${to}'.`,
          path: `/diagrams/classModel/relations/${ri}/to`,
        });
      }

      // impl should usually go class -> interface
      if (
        r.type === "implementation" &&
        !(classes.has(from) && interfaces.has(to))
      ) {
        diagnostics.push({
          severity: "warning",
          code: "IMPL_DIRECTION_SUSPECT",
          message: `Implementation usually goes Class -> Interface; got '${from}' -> '${to}'.`,
          path: `/diagrams/classModel/relations/${ri}`,
        });
      }
    }
  }

  // --- Component semantic checks ---
  const cd = ir.diagrams?.component;
  if (cd) {
    const comps = new Map<string, any>();
    for (let i = 0; i < (cd.components || []).length; i++) {
      const c = cd.components[i];
      if (comps.has(c.id)) {
        diagnostics.push({
          severity: "error",
          code: "DUPLICATE_COMPONENT_ID",
          message: `Duplicate component id '${c.id}'.`,
          path: `/diagrams/component/components/${i}`,
        });
      }
      comps.set(c.id, c);
    }

    for (let li = 0; li < (cd.links || []).length; li++) {
      const l = cd.links[li];
      if (!comps.has(l.from)) {
        diagnostics.push({
          severity: "error",
          code: "LINK_UNKNOWN_COMPONENT",
          message: `Link.from references unknown component '${l.from}'.`,
          path: `/diagrams/component/links/${li}/from`,
        });
      }
      if (!comps.has(l.to)) {
        diagnostics.push({
          severity: "error",
          code: "LINK_UNKNOWN_COMPONENT",
          message: `Link.to references unknown component '${l.to}'.`,
          path: `/diagrams/component/links/${li}/to`,
        });
      }

      const to = comps.get(l.to);
      if (l.type === "db" && to && to.type !== "db") {
        diagnostics.push({
          severity: "warning",
          code: "LINK_DB_TO_NON_DB",
          message: `Link VIA db points to '${l.to}' which is type '${to.type}'.`,
          path: `/diagrams/component/links/${li}`,
        });
      }
      if (l.type === "queue" && to && to.type !== "queue") {
        diagnostics.push({
          severity: "warning",
          code: "LINK_QUEUE_TO_NON_QUEUE",
          message: `Link VIA queue points to '${l.to}' which is type '${to.type}'.`,
          path: `/diagrams/component/links/${li}`,
        });
      }
      if (l.type === "cache" && to && to.type !== "cache") {
        diagnostics.push({
          severity: "warning",
          code: "LINK_CACHE_TO_NON_CACHE",
          message: `Link VIA cache points to '${l.to}' which is type '${to.type}'.`,
          path: `/diagrams/component/links/${li}`,
        });
      }
    }
  }

  const ok = diagnostics.every((d) => d.severity !== "error");
  return ok
    ? { ok: true, result: null, diagnostics }
    : { ok: false, diagnostics };
}
```

---

## 7) DiagramIR JSON Schema validation (`validateDiagramIr()`)

Same pattern as AST validation, using AJV compiled with your `diagram-ir-v1.schema.json`.

Pseudo:

```ts
const validateIr = ajv.compile(diagramIrSchema);
if (!validateIr(ir))
  diagnostics.push(...ajvErrorsToDiagnostics("IR_SCHEMA", validateIr.errors));
```

---

## 8) MCP tool wiring (high-level)

Tools you should expose initially:

- `uml_parse_ascii` → returns AST
- `uml_ast_to_ir` → returns IR + diagnostics (lossy report as warnings/info)
- `uml_resolve_symbols` → returns IR (fixed) + diagnostics
- `uml_validate_ir` → runs schema + semantic checks; returns ok + diagnostics

Recommended “one-shot” convenience tool:

- `uml_ascii_to_ir` = parse → ast validate → ast→ir → resolve → ir schema validate → semantic validate

---

## 9) Minimal “one-shot” function

```ts
export function asciiToValidatedIr(
  kind: "class" | "component",
  input: string,
  meta: { projectName: string },
) {
  const parser = new AsciiDslParser({
    grammarPath: "src/dsl/class-component.peggy",
    astSchemaPath: "src/dsl/ast-schema.json",
  });

  const p = parser.parseAsciiToAst(kind, input);
  if (!p.ok) return p;

  const m = astToDiagramIr(p.result!, meta);
  if (!m.ok) return m;

  const r = resolveSymbols(m.result!);
  if (!r.ok) return r;

  // AJV validate DiagramIR schema here (not shown)

  const s = semanticValidateIr(r.result!);
  if (!s.ok) return s;

  return {
    ok: true,
    result: r.result!,
    diagnostics: [
      ...p.diagnostics,
      ...m.diagnostics,
      ...r.diagnostics,
      ...s.diagnostics,
    ],
  };
}
```
