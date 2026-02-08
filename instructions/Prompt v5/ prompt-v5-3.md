Below is a **practical, implementable ASCII DSL grammar** for **Class** and **Component** diagrams. It’s designed to be:

- **LLM-friendly to author**
- **Deterministic to parse** (line-oriented, minimal ambiguity)
- Maps cleanly into your **DiagramIR v1** (classModel + component)

I’m giving:

1. **EBNF-style grammar**
2. **Semantics** (how tokens map to DiagramIR)
3. **Examples** (valid snippets)

---

# 1) Common lexical rules

### Comments / whitespace

- Blank lines ignored
- Comments start with `#` or `//` (entire line)
- Identifiers are **case-sensitive**.

### Tokens

**Identifier**

- `ID := [A-Za-z][A-Za-z0-9_\-\.]*`

**String**

- `STRING := " ... "` (double quotes; allow escaped `\"`)

**Integer**

- `INT := [0-9]+`

**Boolean**

- `BOOL := true | false`

**Cardinality**

- `CARD := 0 | 1 | * | 0..* | 1..* | 0..1 | 1..1`

**Primitive types**

- `PRIM := string | text | boolean | int | bigint | float | decimal | uuid | date | datetime | json | bytes`

---

# 2) Class Diagram ASCII DSL (ClassDSL v1)

## 2.1 Top-level structure

EBNF:

```
ClassFile       := { Statement } ;

Statement       := PackageDecl
                 | ImportDecl
                 | EnumDecl
                 | TypeAliasDecl
                 | ClassDecl
                 | InterfaceDecl
                 | RelationDecl
                 | NoteDecl
                 | TagDecl
                 | EmptyOrComment ;

PackageDecl     := "PACKAGE" ID [ STRING ] "{" { PackageStmt } "}" ;
PackageStmt     := EnumDecl | TypeAliasDecl | ClassDecl | InterfaceDecl | RelationDecl | NoteDecl | TagDecl ;

ImportDecl      := "IMPORT" STRING ;
NoteDecl        := "NOTE" STRING ;
TagDecl         := "TAGS" ":" TagList ;

TagList         := ID { "," ID } ;
```

Semantics:

- `PACKAGE <id> "<display name>" { ... }`
  - `<id>` maps to `Package.id`, display name to `Package.name`. If no display name, use `<id>`.

---

## 2.2 Enums and type aliases

```
EnumDecl        := "ENUM" ID [ STRING ] "{" EnumValue { "," EnumValue } "}" ;
EnumValue       := ID [ ":" STRING ] ;

TypeAliasDecl   := "TYPE" ID [ STRING ] "=" TypeRef ;
```

Semantics:

- `ENUM Status { ACTIVE, SUSPENDED }`
  - creates `EnumType` with `values[]` and auto `id` per value

- `TYPE Email = primitive(string) format(email)`
  - creates `TypeAlias` with `target` TypeRef
  - (see TypeRef below)

---

## 2.3 Class / interface blocks

### Class

```
ClassDecl        := "CLASS" ID [ STRING ] [ ClassHeader ] "{" { ClassMember } "}" ;

ClassHeader      := ( "STEREOTYPES" ":" StereoList )
                    [ "ABSTRACT" ]
                  | "ABSTRACT"
                    [ "STEREOTYPES" ":" StereoList ] ;

StereoList       := ID { "," ID } ;

ClassMember      := AttributeDecl | OperationDecl | NoteDecl | TagDecl ;
```

### Interface

```
InterfaceDecl    := "INTERFACE" ID [ STRING ] "{" { InterfaceMember } "}" ;
InterfaceMember  := OperationDecl | NoteDecl | TagDecl ;
```

Semantics:

- `CLASS User "User" STEREOTYPES: entity,aggregate { ... }`
  - `ClassType.stereotypes=["entity","aggregate"]`

- `ABSTRACT` sets `abstract=true`
- For missing display name: `name = id`.

---

## 2.4 Attributes

Make attributes line-oriented and parseable:

```
AttributeDecl  := ID ":" TypeExpr { AttributeMod } ;

AttributeMod   := "pk"
                | "unique"
                | "nullable"
                | "generated(" GenStrategy ")"
                | "default(" DefaultValue ")"
                | "length(" INT ")"
                | "precision(" INT ")"
                | "scale(" INT ")"
                | "format(" ID ")"
                | "desc(" STRING ")"
                | "tags(" TagList ")" ;

GenStrategy    := "uuid" | "increment" | "none" ;

DefaultValue   := STRING | INT | BOOL | "null" ;
```

### Type expressions

```
TypeExpr       := PRIM
                | ID
                | ID "." ID          # optional namespacing (e.g., patient.Patient)
                | "decimal(" INT "," INT ")"
                | "array<" TypeExpr ">"
                | "set<" TypeExpr ">"
                | "map<" TypeExpr "," TypeExpr ">" ;
```

**Important parsing rule (determinism):**

- If `TypeExpr` is `PRIM` or `decimal(p,s)`, it becomes `PrimitiveTypeRef`.
- If `TypeExpr` is an `ID` / qualified `ID.ID`, it becomes `NamedTypeRef`:
  - `enum`/`typeAlias`/`class` resolution is done in **semantic validation** (not grammar).

**Attribute examples**

```
id: uuid pk generated(uuid)
email: string unique format(email)
bio: text nullable
price: decimal(12,2) default(0)
tags: array<string>
metadata: json nullable
```

---

## 2.5 Operations (optional)

Operations are helpful later for domain services but can be ignored initially.

```
OperationDecl   := "OP" ID "(" [ ParamList ] ")" [ ":" TypeExpr ] { OpMod } ;
ParamList       := Param { "," Param } ;
Param           := ID ":" TypeExpr [ "?" ] ;
OpMod           := "desc(" STRING ")" | "tags(" TagList ")" ;
```

Example:

```
OP changeEmail(newEmail: Email): void desc("Request email change")
```

---

## 2.6 Relations (standalone)

Relations are separate lines, not embedded in classes (simplifies parsing):

```
RelationDecl    := "REL" RelationKind
                   Side "--" Side
                   [ ":" ID ]
                   [ "desc(" STRING ")" ] ;

RelationKind    := "assoc" | "agg" | "comp" | "inherit" | "impl" | "dep" ;

Side            := ID [ Role ] [ CardSpec ] [ NavSpec ] ;
Role            := "(" ID ")" ;
CardSpec        := "[" CARD "]" ;
NavSpec         := ">" | "<" | "<>" ;
```

**Interpretation**

- `Side` always contains a **class id** (`ID`).
- Optional role `(roleName)` maps to `RefClassSide.role`
- Optional cardinality `[0..*]` maps to `RefClassSide.cardinality`
- Navigation:
  - `>` means navigable from left to right
  - `<` means navigable from right to left
  - `<>` means bi-directional
  - If omitted: default `<>` (or your choice; I recommend default `<>`)

**Examples**

```
REL assoc User(owns)[1] -- Project(owner)[0..*] : owns
REL comp Order(items)[1] -- OrderItem(order)[1..*] : contains
REL inherit Admin -- User
REL impl PaymentGateway -- IPaymentGateway
```

Mapping to DiagramIR v1:

- `ClassRelation.type`:
  - assoc → association
  - agg → aggregation
  - comp → composition
  - inherit → inheritance
  - impl → implementation
  - dep → dependency

---

# 3) Component Diagram ASCII DSL (ComponentDSL v1)

Component diagrams are simpler: define nodes + links.

## 3.1 Top-level

```
ComponentFile     := { ComponentStmt } ;

ComponentStmt     := ComponentDecl
                   | LinkDecl
                   | NoteDecl
                   | TagDecl
                   | EmptyOrComment ;
```

## 3.2 Component declarations

```
ComponentDecl     := "COMPONENT" ID [ STRING ]
                     "TYPE" ComponentType
                     [ "TECH" TechSpec ]
                     [ "CAPS" ":" CapList ]
                     [ "STEREOTYPES" ":" StereoList ]
                     [ "TAGS" ":" TagList ]
                     [ "DESC" STRING ] ;

ComponentType     := "service" | "gateway" | "worker" | "db" | "cache" | "queue"
                   | "eventBus" | "storage" | "search" | "external" | "library" ;

CapList           := Cap { "," Cap } ;
Cap               := "acid" | "transactions" | "eventSourcing" | "cqrs" | "idempotency"
                   | "rateLimiting" | "caching" | "pubsub" | "dlq" | "outbox" ;

TechSpec          := ID [ "@" ID ] ;
```

Examples:

```
COMPONENT API TYPE service TECH nestjs@10 CAPS: rateLimiting TAGS: core DESC "HTTP API"
COMPONENT Postgres TYPE db TECH postgres@16 CAPS: acid,transactions
COMPONENT Redis TYPE cache TECH redis@7 CAPS: caching
COMPONENT Queue TYPE queue TECH bullmq@5 CAPS: dlq
COMPONENT Stripe TYPE external TECH stripe DESC "Payment provider"
```

Mapping to DiagramIR v1:

- `Component.id`, `Component.name` (default = id if no string), `Component.type`
- `tech.name`, `tech.version` from `TECH x@y`
- `capabilities[]` from `CAPS:`

## 3.3 Links

```
LinkDecl        := "LINK" ID "->" ID
                   [ "VIA" LinkType ]
                   [ "DIR" Direction ]
                   [ "LABEL" STRING ]
                   [ "DESC" STRING ] ;

LinkType        := "http" | "grpc" | "db" | "cache" | "queue" | "event" | "file" | "inproc" ;
Direction       := "uni" | "bi" ;
```

Examples:

```
LINK API -> Postgres VIA db
LINK API -> Redis VIA cache
LINK API -> Queue VIA queue
LINK Queue -> Worker VIA inproc
LINK API -> Stripe VIA http LABEL "charge"
```

Mapping:

- `ComponentLink.from`, `to`, `type`, `direction`, `label`, `description`

---

# 4) Deterministic parsing rules (so your parser doesn’t become “LLM-ish”)

1. **Block constructs**: `PACKAGE {...}`, `CLASS {...}`, `INTERFACE {...}`, `ENUM {...}` must be properly nested; no implicit termination.
2. **Everything is line-oriented** inside blocks:
   - Class members are single-line statements (`attr`, `OP`, `NOTE`, `TAGS`).

3. **Relation and link statements are always single-line**.
4. **Qualified type names** (`package.Type`) are allowed but optional; if present, resolution is semantic validation.
5. **No commas in attribute declarations** (keeps lexer simple). Attributes are one per line.

---

# 5) Minimal examples

## Class example

```text
PACKAGE billing "Billing" {
  ENUM InvoiceStatus { DRAFT, SENT, PAID, VOID }

  TYPE Money = decimal(12,2)

  CLASS Invoice STEREOTYPES: entity {
    id: uuid pk generated(uuid)
    number: string unique
    status: InvoiceStatus default("DRAFT")
    total: Money default(0)
    createdAt: datetime
  }

  CLASS LineItem {
    id: uuid pk generated(uuid)
    invoiceId: uuid
    description: string
    amount: Money
  }

  REL comp Invoice(items)[1] -- LineItem(invoice)[1..*] : contains
}
```

## Component example

```text
COMPONENT API TYPE service TECH nestjs@10 CAPS: rateLimiting TAGS: core
COMPONENT Postgres TYPE db TECH postgres@16 CAPS: acid,transactions
COMPONENT Redis TYPE cache TECH redis@7 CAPS: caching
COMPONENT Queue TYPE queue TECH bullmq@5 CAPS: dlq
COMPONENT Worker TYPE worker TECH nestjs@10

LINK API -> Postgres VIA db
LINK API -> Redis VIA cache
LINK API -> Queue VIA queue
LINK Queue -> Worker VIA inproc
```

---

If you want the next step, I can provide a **JSON Schema for the DSL AST** (separate from DiagramIR) and a **complete PEG grammar** (e.g., for `peggy` / `nearley` / `antlr`) so implementation is straightforward.
