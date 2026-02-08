# ASCII UML DSL v1 (Class + Component)

This DSL is deliberately *strict* and *machine-parseable*. It targets:
- **Class diagrams** (primary input for spec generation)
- **Component diagrams** (module boundaries: queue, cache, ACID store, etc.)

It compiles into **DiagramIR v1** (`diagramir.schema.json`).

---

## 1) Lexical conventions

### 1.1 Whitespace & comments
- Whitespace is insignificant except within quoted strings.
- Line comments start with `#` or `//` and run to end of line.
- Block comments are not supported.

### 1.2 Identifiers
`IDENT := [A-Za-z_][A-Za-z0-9_\-:.]*`

Examples: `User`, `user-service`, `class.User`, `component.queue`.

### 1.3 Strings
`STRING := " ... "` (double-quoted; supports `\"` and `\\`)

### 1.4 Visibility
- `+` public
- `#` protected
- `-` private
- `~` package

### 1.5 Types
Type references are *syntactic*, not semantic:

- `TypeRef := IDENT ( "<" TypeRef ("," TypeRef)* ">" )? ("?")? ("[]")?`
  - `?` means nullable
  - `[]` means array

Examples: `string`, `UUID`, `List<User>`, `User?`, `User[]`, `Map<string,Order>`.

---

## 2) Top-level structure

A file may define **one** diagram. (If you need multiple diagrams, send multiple DSL blocks.)

```
Document      := DiagramHeader NEWLINE Statement*
DiagramHeader := "@classdiagram" Name? DiagramOptions?
              | "@componentdiagram" Name? DiagramOptions?

Name          := IDENT | STRING
DiagramOptions:= "(" Option ("," Option)* ")"
Option        := "id" "=" IDENT
              | "direction" "=" ("LR"|"TB"|"RL"|"BT")
```

Notes:
- If `id` is omitted, the compiler generates one.
- `direction` maps to `layoutHint.direction`.

---

## 3) Class diagram statements

### 3.1 Classifier declarations

```
Statement     := ClassDecl | InterfaceDecl | EnumDecl | Relationship | NoteDecl

ClassDecl     := "class" Name Alias? StereoList? ClassBody?
InterfaceDecl := "interface" Name Alias? StereoList? ClassBody?
EnumDecl      := "enum" Name Alias? StereoList? EnumBody?

Name          := IDENT | STRING
Alias         := "as" IDENT
StereoList    := "<<" Stereotype ("," Stereotype)* ">>"
Stereotype    := IDENT
```

Classifier body:

```
ClassBody     := "{" NEWLINE? Member* "}"
Member        := AttributeDecl | OperationDecl | NoteInline

AttributeDecl := Visibility? "static"? "readonly"? IDENT ":" TypeRef Default? Tags? NEWLINE
Default       := "=" Literal
Literal       := STRING | NUMBER | "true" | "false" | "null"

OperationDecl := Visibility? "static"? "abstract"? IDENT "(" ParamList? ")" ReturnType? Tags? NEWLINE
ParamList     := Param ("," Param)*
Param         := IDENT ":" TypeRef Default?
ReturnType    := ":" TypeRef
Tags          := "[" Tag ("," Tag)* "]"
Tag           := IDENT ("=" (STRING|NUMBER|"true"|"false"|"null"))?
```

Examples:

```text
@classdiagram "Auth Domain" (direction=LR)

class User as class.User <<aggregate_root>> {
  +id: UUID [pk]
  +email: string [unique]
  +passwordHash: string
  +login(password: string): Token
}

interface ITokenIssuer {
  +issue(userId: UUID): Token
}
```

### 3.2 Relationships (class)

Relationships are declared as **one line** edges.

```
Relationship  := Endpoint AssocOp Endpoint EdgeLabel? Tags? NEWLINE
Endpoint      := Ref Multiplicity? RoleName?
Ref           := IDENT
Multiplicity  := QUOTED_MULT
QUOTED_MULT   := "\"" MULT "\""
MULT          := "*" | INT | INT ".." ("*"|INT)
RoleName      := ":" IDENT

AssocOp       := "--"   | "-->"  | "<--"  | "<-->"
              | "o--"  | "o-->" | "<--o" | "<--o>"
              | "*--"  | "*-->" | "<--*" | "<--*>"
              | "..>"  | "<.."  | "<..>"  # dependency
              | "<|--" | "<|.."  # generalization / realization
```

Operator mapping (to DiagramIR `Relationship.type`):

- `--`, `-->`, `<--`, `<-->` → `association`
- `o--`, `o-->`, `<--o`, `<--o>` → `aggregation`
- `*--`, `*-->`, `<--*`, `<--*>` → `composition`
- `..>` / `<..` / `<..>` → `dependency`
- `<|--` → `generalization`
- `<|..` → `realization`

Navigability mapping (`Relationship.navigability`):
- `-->` means `from-to`
- `<--` means `to-from`
- `<-->` means `both`
- `--` means `none`
(similarly for other operators)

Edge label:

```
EdgeLabel := ":" Text
Text      := (any char except NEWLINE)*
```

Examples:

```text
User "1" o-- "*" Session : owns
User --> ITokenIssuer : uses [runtime]
Admin <|-- User
UserRepository ..> Db : reads/writes
```

---

## 4) Component diagram statements

### 4.1 Component + interface declarations

```
Statement       := ComponentDecl | InterfaceDecl | Relationship | NoteDecl

ComponentDecl   := "component" Name Alias? StereoList? ComponentBody?
ComponentBody   := "{" NEWLINE? PortDecl* "}"

PortDecl        := ("provides"|"requires") IDENT ":" Ref Tags? NEWLINE
```

Interfaces in component diagrams use the same `interface` production as in class diagrams.

Examples:

```text
@componentdiagram "Runtime Modules" (direction=TB)

interface IQueue {
  +enqueue(job: Job): void
}

component "Queue" as component.queue <<bullmq>> {
  provides queue:IQueue
}

component "Auth Service" as component.auth <<service>> {
  requires queue:IQueue
}

component "Postgres" as component.db <<acid_store>>
component "Redis" as component.cache <<cache>>
component "S3" as component.blob <<blob_store>>

component.auth ..> component.db : persists
component.auth ..> component.cache : caches
component.auth ..> component.queue : publishes
```

### 4.2 Component relationship guidance

Prefer these edge operators:
- `..>` for dependencies between modules/components
- `-->` for directed association/usage
- `o-->` / `*-->` only when you *really* mean ownership/lifecycle coupling (rare at component level)

---

## 5) Notes (optional)

Two note styles are supported:

```
NoteDecl    := "note" "for" Ref ":" Text NEWLINE
NoteInline  := "///" Text NEWLINE
```

Notes compile into `tags` + `doc.details` where possible.

---

## 6) Minimal validation rules (compiler side)

The schema validates structure; the compiler/validator must also enforce:

1. **Declared references**: every `Ref` used in an edge must resolve to a declared alias/name within the file.
2. **Unique ids**: `Alias` identifiers must be unique.
3. **Class diagram purity**: `@classdiagram` must not contain `component` declarations.
4. **Component diagram purity**: `@componentdiagram` must not contain `class`/`enum` declarations (interfaces are allowed).
5. **Multiplicity format**: must match `*`, `N`, or `N..M` where `M` is `*` or `N`.
6. **No cycles for composition** (optional but recommended): prevent `composition` edges that form cycles.

---

## 7) DiagramIR compilation mapping (high level)

- Each declaration (`class`, `interface`, `enum`, `component`) → `Diagram.elements[]`
- Each edge line → `Diagram.relationships[]`
- Ports (`provides`/`requires`) → `component.ports[]`
- Stereotypes (`<<...>>`) → `element.stereotypes[]`
- Tags (`[...]`) → `element.tags[]` or `relationship.tags[]`
- `Visibility` tokens map to `public/protected/private/package`
