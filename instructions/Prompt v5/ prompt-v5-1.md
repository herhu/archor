You’re on the right track: treat “diagram ⇄ spec” as the **primary contract** in the pipeline, with natural language acting as _an assistant to converge on a valid diagram/spec_, not the source of truth.

You already have the foundation: **Archon DesignSpec v1 + schema validation (AJV) + semantic validation**, and an MCP server wrapping validation + generation tools.

Below is a concrete **design architecture** for the new “UML MCP” phase, including: IR model, validators, tools, and how each diagram participates in the main process.

---

## 1) Core principle: introduce a Diagram IR as the “bridge”

Instead of trying to convert _any_ UML variant directly into DesignSpec, create a stable middle layer:

### Pipeline

**Natural language → DiagramIR → (UML renderers) + (Spec generator) → DesignSpec v1 → code generation**

### Why IR is non-negotiable

- You can validate early (“is this diagram structurally complete?”) before spec generation.
- You can support **multiple input syntaxes** (ASCII, PlantUML-like, Mermaid-like, image-extracted text later) without rewriting the spec generator.
- You can do **round-trips**: `DesignSpec → DiagramIR → UML`.

---

## 2) What to validate (yes, you need a schema validator)

You should have **two validation layers**, mirroring what you already do in Archon:

1. **Diagram schema validation** (structural correctness)
2. **Diagram semantic validation** (cross-references, completeness rules, “no ambiguity” rules)

This matches your existing approach: Archon validates schema + semantic, and blocks generation if invalid.

### Diagram validation examples (semantic)

- **Class diagram**: each association references existing classes; attribute types are known or resolvable; primary keys exist; multiplicities make sense.
- **Use case**: each use case maps to a service operation or CRUD intent; actor permissions resolve to authz scopes.
- **Sequence**: each message references a known service/component; synchronous vs async calls align with component capabilities (queue/event bus).
- **Component**: every component has a boundary + dependencies are acyclic (or explicitly allowed cycles), “queue/cache/db” are declared infrastructure components.

---

## 3) Diagram types and what they are used for in your process

### A) Use Case Diagram (easy to understand)

**Purpose:** convert ambiguity → stable functional intent.

**Output into IR:**

- actors
- use cases
- includes/extends
- mapping hints: “use case → domain/service/operation”

**Validation rule:** every use case must map to at least one planned API capability (CRUD or operation), even if initially “TBD”.

### B) Class Model (main driver for spec)

**Purpose:** becomes your spec generator backbone.

**Output into IR:**

- classes → entities
- attributes → fields
- relations → references (you might start simple: just record relations and later map to TypeORM relations if you want)
- constraints: PK, nullable, enums, unique, indexes

**Mapping into Archon DesignSpec v1:**

- class package/bounded context → `domain`
- class → `entity`
- attributes → `fields`
- service definitions can be inferred from use cases or a “service block” in IR; otherwise default CRUD service per entity.

### C) Component Diagram (modules: queue, acid, cache, etc.)

**Purpose:** informs `modules[]` and platform/crosscutting.

You already have `modules[]` in DesignSpec with examples like `cache.redis` and `queue.bullmq`.
So component diagram maps cleanly to:

- `modules[]` (redis, queues)
- future: outbox/event bus, object storage, search
- “ACID” is not a component; it’s a property of the DB/transaction strategy. So in the diagram model treat it as **data store capability** (e.g., `postgres.transactions=required`) rather than a “box”.

### D) Sequence Diagram

**Purpose:** define runtime flows + integration boundaries.

Maps to:

- custom operations (`service.operations[]`)
- sync/async patterns (if message goes through Queue component, generate operation + job handler stub later)

---

## 4) Two input approaches you described

### Approach 1: Paste an image of the class model → generate spec

Design-wise:

- In MCP, the “image to diagram text” step should output **DiagramIR**, not directly DesignSpec.
- Then: validate IR → generate DesignSpec.

Practical note: “image parsing” will be the hardest part (vision + OCR-like extraction). Architect it as a plugin stage:

- `image → extractedDiagramText` (best-effort)
- `extractedDiagramText → DiagramIR` (deterministic parser + LLM fallback)
- `DiagramIR → validated → DesignSpec`

### Approach 2: Design in chat using ASCII

This is the fastest to implement and the most reliable.

You can define a constrained ASCII DSL like:

```text
CLASS User {
  id: uuid pk
  email: string unique
}

CLASS Project {
  id: uuid pk
  ownerId: uuid fk -> User.id
}

REL User 1..1 -> 0..* Project : owns
```

This parses cleanly into DiagramIR and validates deterministically.

---

## 5) MCP server architecture: extend Archon MCP or add a new MCP?

You already have `archon-mcp` exposing:

- validate spec
- generate project
- serve schema resource
- list modules

### Recommended: create a **second MCP** (clean separation)

- `archon-mcp`: “spec → code”
- `uml-mcp`: “text/image ↔ diagrams ↔ spec”

But keep them compatible: `uml-mcp` should output an **Archon DesignSpec v1** object that `archon-mcp` can validate/generate.

---

## 6) Proposed UML MCP: tools, resources, prompts

### Tools (minimum set)

1. **uml_parse_ascii**
   - input: ASCII diagram text + declared diagram type (`class|usecase|component|sequence`)
   - output: DiagramIR JSON + diagnostics

2. **uml_validate_ir**
   - input: DiagramIR
   - output: schema errors + semantic errors

3. **uml_ir_to_designspec**
   - input: DiagramIR
   - output: DesignSpec v1 JSON (plus “lossy mapping report”)

4. **uml_designspec_to_ir**
   - input: DesignSpec v1
   - output: DiagramIR (for round-trip and updates)

5. **uml_ir_to_mermaid**
   - input: DiagramIR + diagram type
   - output: Mermaid text (or PlantUML) for rendering

6. **uml_merge_nl_change**
   - input: current DiagramIR + natural language change request
   - output: updated DiagramIR + explanation + validation results
   - this is where the “interaction between natural language and expert” lives: you update the diagram, not the spec directly.

### Resources

- `uml://schema/diagram-ir-v1` (JSON Schema or Zod-derived)
- `uml://dsl/class-ascii-v1` (DSL specification + examples)
- `uml://mapping/class-to-designspec-v1` (rules + edge cases)

### Prompts

- “diagram authoring mode” (teaches the user how to express diagrams in ASCII DSL)
- “ambiguity resolver” (asks targeted questions to fill missing IR fields)

This mirrors how your current MCP provides a “welcome architect mode” prompt.

---

## 7) DiagramIR v1 (what it should contain)

Keep it explicit and typed. Example shape:

```json
{
  "version": "1.0.0",
  "project": "MyApp",
  "diagrams": {
    "classModel": {
      "packages": [
        {
          "name": "patient",
          "entities": [
            {
              "name": "Patient",
              "primaryKey": "id",
              "fields": [
                { "name": "id", "type": "uuid", "primary": true },
                { "name": "email", "type": "string", "nullable": false }
              ],
              "relations": [
                {
                  "type": "oneToMany",
                  "target": "Appointment",
                  "field": "appointments"
                }
              ]
            }
          ]
        }
      ]
    },
    "components": {
      "components": [
        { "name": "API", "type": "service" },
        { "name": "Postgres", "type": "db", "capabilities": ["acid"] },
        { "name": "Redis", "type": "cache" },
        { "name": "Queue", "type": "queue" }
      ],
      "links": [
        { "from": "API", "to": "Postgres" },
        { "from": "API", "to": "Redis" },
        { "from": "API", "to": "Queue" }
      ]
    }
  }
}
```

Then mapping to DesignSpec v1:

- `packages[] → domains[]`
- `entities[] → domain.entities[]`
- `components[] → spec.modules[]` (redis, bullmq, etc.)

Archon already supports `modules` injection in generation (redis + bullmq).

---

## 8) The “MAIN process” you asked for

### Main loop (authoritative)

1. **User provides ambiguous NL**
2. System produces/updates **Use Case diagram** (resolve intent)
3. System produces/updates **Class diagram** (authoritative data model)
4. System produces/updates **Component diagram** (module selection)
5. System produces/updates **Sequence diagram** (critical flows)
6. Validate DiagramIR (schema + semantic)
7. Generate **DesignSpec v1**
8. Validate DesignSpec (existing Archon validation)
9. Generate code (existing Archon generator)

This aligns perfectly with your “ambiguous NL → diagram → spec → code generated” goal.

---

## 9) What to implement first (fastest path)

1. **ASCII Class DSL → DiagramIR → DesignSpec v1**
2. IR validator (schema + semantic)
3. Component DSL minimal: emit `modules[]` (redis/queue first)
4. Later: Use case + sequence (they enrich `services.operations`)

This gives you immediate end-to-end value, because **Class Model alone can already produce domains/entities/services CRUD** in Archon today.

---

If you want, next I can draft:

- the exact **DiagramIR v1 JSON Schema** (draft-07 like your spec schema),
- the **ASCII DSL grammar** for class/component diagrams,
- and the concrete mapping rules to your existing `DesignSpec v1` so it plugs directly into `archon_validate_spec` / `archon_generate_project`.
