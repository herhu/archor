Got it. Here’s the **AST → DiagramIR mapping spec** (deterministic rules + edge cases) for **ClassDSL** and **ComponentDSL**.

---

## 1) Inputs/outputs

### Input

- AST validated by `ascii-uml-dsl-ast-v1.schema.json`:
  - `kind = "class"` or `kind = "component"`

### Output

- **DiagramIR v1** object:
  - `version: "1.0.0"`
  - `meta` (populate minimally)
  - `diagrams.classModel` and/or `diagrams.component`

---

## 2) Global mapping defaults

### 2.1 IDs and display names

- If AST node has `displayName`:
  - DiagramIR `name = displayName`

- Else:
  - DiagramIR `name = id`

### 2.2 Notes / tags

- `NOTE "..."` at top-level:
  - append to `diagram.notes` (string) with `\n\n` separator

- `TAGS: a,b,c` at top-level:
  - attach to **diagram-level** tags if you choose to store them (DiagramIR v1 currently has `notes` but not top-level tags per diagram; recommended: keep these in `meta.tags`).

### 2.3 Imports

- `IMPORT "..."`:
  - store in `meta.source.notes` or `meta.tags` or ignore at IR level
  - recommendation: keep as `meta.source.notes += "\nIMPORT: ..."` for traceability.

---

## 3) ClassDSL AST → `diagrams.classModel`

### 3.1 Diagram skeleton

Create:

```json
{
  "diagrams": {
    "classModel": {
      "title": "<optional>",
      "packages": [],
      "types": [],
      "enums": [],
      "relations": [],
      "notes": ""
    }
  }
}
```

### 3.2 Package handling

#### If AST has `PackageDecl`

- For each package statement:
  - create `Package`:
    - `id = ast.id`
    - `name = displayName || id`
    - `description` not set unless you want to use NOTE inside package
    - `elements = []`
    - `tags` not set unless you add `TAGS` support inside package (AST already allows it)

- All declarations inside the package map into that package’s `elements` or the diagram’s `relations`.

#### If AST has no packages

- Create an implicit package:
  - `id = "default"`
  - `name = meta.projectName || "default"`
  - Put all class/interface/enum/typeAlias into that package

### 3.3 EnumDecl mapping

- `EnumDecl` becomes a DiagramIR `EnumType` element:
  - `kind: "enum"`
  - `id: enum.id`
  - `name: displayName||id`
  - `values[]`:
    - each `{ id: value.id, name: value.id, description?: value.description }`

- Placement rules:
  - If declared inside a package: add to that package’s `elements`
  - If declared top-level: add to implicit package OR (optional) also copy to `classModel.enums`
    - Recommendation: **store in package only** to avoid duplicates, unless you want global enums. DiagramIR supports both; pick one convention and stick to it.

### 3.4 TypeAliasDecl mapping

- `TypeAliasDecl` → DiagramIR `TypeAlias`:
  - `kind: "typeAlias"`
  - `id`, `name`, `description?`
  - `target` converted from AST `TypeExpr` (see 3.8)

- Placement same as enum.

### 3.5 ClassDecl mapping

- `ClassDecl` → DiagramIR `ClassType`:
  - `kind: "class"`
  - `id`, `name`
  - `abstract` if present
  - `stereotypes` array if present
  - `attributes`: from `AttributeDecl` members
  - `operations`: from `OperationDecl` members (optional)
  - If NOTE appears inside class:
    - append to `description` (join with `\n\n`)

  - If TAGS appears inside class:
    - store in `tags`

### 3.6 InterfaceDecl mapping

- `InterfaceDecl` → DiagramIR `InterfaceType`:
  - `kind: "interface"`
  - `id`, `name`
  - `operations`: from members
  - NOTE/TAGS as above

### 3.7 RelationDecl mapping

AST `RelationDecl` → DiagramIR `ClassRelation`:

**Type mapping**

- assoc → association
- agg → aggregation
- comp → composition
- inherit → inheritance
- impl → implementation
- dep → dependency

**Sides**

- `left.classId` → `from.classId`
- `right.classId` → `to.classId`
- `role` → `role`
- `card` → `cardinality`
- `nav`:
  - `lr` = navigable true on `from`, true on `to`?
    Recommended: represent “navigable direction” using booleans:
    - If `lr`: `from.navigable=true`, `to.navigable=false` (meaning arrow goes left→right)
    - If `rl`: `from.navigable=false`, `to.navigable=true`
    - If `bi`: both true

DiagramIR v1 `RefClassSide` has only `navigable` boolean, not separate arrow direction; the above is the closest deterministic encoding.

**Name/description**

- `name` → `ClassRelation.name`
- `desc` → `ClassRelation.description`

**Storage**

- Always append relations to `classModel.relations[]`
- Do not embed inside classes (keeps IR normalized)

### 3.8 TypeExpr mapping (AST → DiagramIR `TypeRef`)

AST types map as follows:

#### Primitive

AST: `{ kind:"prim", name:"string" }`

- DiagramIR:

  ```json
  { "kind": "primitive", "name": "string" }
  ```

Special case:

- AST prim `void` (used for operation returns):
  - In DiagramIR you can either:
    1. omit `returns` entirely, or
    2. encode as primitive `string`? (don’t)

  - Recommendation: **omit returns** for void.

#### Decimal

AST: `{ kind:"decimal", precision:p, scale:s }`

- DiagramIR:

  ```json
  { "kind": "primitive", "name": "decimal" }
  ```

  plus attribute modifiers:
  - set `precision=p`, `scale=s` on the **Attribute** node, not inside TypeRef (DiagramIR v1 puts precision/scale on Attribute).

- For type alias `TYPE Money = decimal(12,2)`:
  - Represent `target` as primitive decimal (no precision there),
  - store precision/scale is not supported at TypeAlias target level in current DiagramIR.
  - Two options:
    - **Option A (recommended):** allow `TypeAlias` to carry vendor config via tags or description (lossy).
    - **Option B:** extend DiagramIR TypeRef to include decimal params.

  - If you want strictness now: prefer A and document it.

#### Named

AST: `{ kind:"named", name:"Email" }` or `"billing.InvoiceStatus"`

- DiagramIR:

  ```json
  {
    "kind": "named",
    "ref": { "kind": "typeAlias|enum|class|interface", "id": "<resolved>" }
  }
  ```

But AST doesn’t know what it refers to. So conversion is **two-phase**:

**Phase 1 (syntactic IR)**:

- emit a placeholder ref:
  - `ref.kind = "typeAlias"` (or `"class"`) is not knowable yet.

- Recommendation: in conversion output, set:

  ```json
  { "kind": "named", "ref": { "kind": "typeAlias", "id": "Email" } }
  ```

  and fix during semantic resolution.

**Phase 2 (semantic resolution)**:

- Build symbol tables:
  - classes, interfaces, enums, typeAliases across packages

- If qualified `pkg.Type`:
  - resolve within package `pkg`

- Else resolve unique match across all packages
- Resolution precedence (recommended):
  1. typeAlias
  2. enum
  3. class
  4. interface

- If ambiguous: semantic validation error.

#### Collections

AST:

- `{ kind:"array", of:T }` → DiagramIR:

  ```json
  { "kind": "collection", "collection": "array", "of": <TypeRef(T)> }
  ```

- `{ kind:"set", of:T }` similarly with `"set"`
- `{ kind:"map", key:K, value:V }`:

  ```json
  { "kind":"collection", "collection":"map", "keyType": <TypeRef(K)>, "of": <TypeRef(V)> }
  ```

### 3.9 AttributeDecl mapping

AST attribute fields:

- `name` → `Attribute.name`
- `valueType` → `Attribute.type`
- `mods`:
  - `pk` → `primaryKey:true`
  - `unique` → `unique:true`
  - `nullable` → `nullable:true`
  - `generated` → `generated:"uuid"|"increment"|"none"`
  - `default` → `default:<any>`
  - `length` → `length:int`
  - `precision/scale` → `precision/scale` on Attribute
  - `format`:
    - DiagramIR primitive type supports `format` on the TypeRef; but AttributeMod has `format`.
    - Recommended: if Attribute.type is primitive, set `type.format = mods.format`.
    - If named/collection: keep `mods.format` as a tag or ignore (semantic warning).

  - `desc` → `description`
  - `tags` → `tags`

---

## 4) ComponentDSL AST → `diagrams.component`

### 4.1 Diagram skeleton

```json
{
  "diagrams": {
    "component": {
      "components": [],
      "links": [],
      "notes": ""
    }
  }
}
```

### 4.2 ComponentDecl mapping

AST:

```json
{ type:"component", id, displayName?, compType, tech?, caps?, stereotypes?, tags?, desc? }
```

DiagramIR:

- `id`, `name`
- `type = compType`
- `tech`:
  - if present: `{ name, version? }`

- `capabilities = caps[]`
- `stereotypes` pass-through
- `tags` pass-through
- `description = desc`

### 4.3 LinkDecl mapping

AST:

```json
{ type:"link", from, to, via?, dir?, label?, desc? }
```

DiagramIR:

- `from`, `to`
- `type = via || "http"`
- `direction = dir || "uni"`
- `label`, `description`

---

## 5) Semantic validation rules you should enforce immediately

These aren’t grammar-level; run them in `uml_validate_ir` or `uml_validate_ast`:

### Class model rules

- All `ClassRelation.from.classId` / `to.classId` exist as declared classes (or interfaces for impl).
- No duplicate `id` within the same symbol kind (class vs enum etc.). (Or enforce global uniqueness across all elements; recommended.)
- Each class has at most one PK attribute (`primaryKey=true`) unless you explicitly support composite keys.
- If `generated=uuid|increment` then `primaryKey=true` must also be true (or warning).
- If `precision`/`scale` set, type must be decimal (primitive or alias resolved to decimal).

### Component rules

- All `Link.from/to` ids exist in `components[]`
- For `via=db`, `to` should be a db component (or warning)
- For `via=queue`, `to` should be queue component (or warning)

---

## 6) “Lossiness report” (strongly recommended)

When converting AST→IR (and later IR→DesignSpec), emit a sidecar list:

- unresolved named types
- decimal alias precision/scale not representable
- format mods attached to non-primitive types
- orphan tags/notes

This becomes your “expert feedback loop” surface.

---

If you want next, I can provide:

- a **reference implementation outline** (TypeScript) for:
  - `parseAsciiToAst()`
  - `astToDiagramIr()`
  - `resolveSymbols()` + semantic checks

- and the exact **error object schema** you should return from MCP tools (compatible with AJV + nice UX).
