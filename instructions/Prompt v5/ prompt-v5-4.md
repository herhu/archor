Cool — here are **(A) a DSL AST JSON Schema (draft-07)** and **(B) a complete PEG grammar** you can drop into **peggy** (recommended) or adapt to other PEG parsers.

The intent: **ASCII DSL → AST (validated) → DiagramIR**. Keep AST as the “lossless parse result”, then do resolution + semantic checks when converting to DiagramIR.

---

## A) DSL AST v1 JSON Schema (draft-07)

This schema validates the _parsed_ structure from both **ClassDSL** and **ComponentDSL**.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://10kgoal.dev/schemas/ascii-uml-dsl-ast-v1.schema.json",
  "title": "ASCII UML DSL AST v1",
  "description": "AST for line-oriented ASCII DSL for Class and Component diagrams. Draft-07.",
  "type": "object",
  "additionalProperties": false,
  "required": ["version", "kind", "statements"],
  "properties": {
    "version": {
      "type": "string",
      "const": "1.0.0"
    },
    "kind": {
      "type": "string",
      "enum": ["class", "component"]
    },
    "statements": {
      "type": "array",
      "items": { "$ref": "#/definitions/Statement" }
    }
  },
  "definitions": {
    "Id": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[A-Za-z][A-Za-z0-9_\\-\\.]*$"
    },
    "String": {
      "type": "string"
    },
    "TagList": {
      "type": "array",
      "items": { "$ref": "#/definitions/Id" }
    },
    "StereoList": {
      "type": "array",
      "items": { "$ref": "#/definitions/Id" }
    },

    "Statement": {
      "oneOf": [
        { "$ref": "#/definitions/PackageDecl" },
        { "$ref": "#/definitions/ImportDecl" },
        { "$ref": "#/definitions/EnumDecl" },
        { "$ref": "#/definitions/TypeAliasDecl" },
        { "$ref": "#/definitions/ClassDecl" },
        { "$ref": "#/definitions/InterfaceDecl" },
        { "$ref": "#/definitions/RelationDecl" },
        { "$ref": "#/definitions/NoteDecl" },
        { "$ref": "#/definitions/TagsDecl" },

        { "$ref": "#/definitions/ComponentDecl" },
        { "$ref": "#/definitions/LinkDecl" }
      ]
    },

    "ImportDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "path"],
      "properties": {
        "type": { "const": "import" },
        "path": { "$ref": "#/definitions/String" }
      }
    },

    "NoteDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "text"],
      "properties": {
        "type": { "const": "note" },
        "text": { "$ref": "#/definitions/String" }
      }
    },

    "TagsDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "tags"],
      "properties": {
        "type": { "const": "tags" },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "PackageDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "id", "body"],
      "properties": {
        "type": { "const": "package" },
        "id": { "$ref": "#/definitions/Id" },
        "displayName": { "$ref": "#/definitions/String" },
        "body": {
          "type": "array",
          "items": { "$ref": "#/definitions/Statement" }
        }
      }
    },

    "EnumDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "id", "values"],
      "properties": {
        "type": { "const": "enum" },
        "id": { "$ref": "#/definitions/Id" },
        "displayName": { "$ref": "#/definitions/String" },
        "values": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/definitions/EnumValue" }
        }
      }
    },

    "EnumValue": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "description": { "$ref": "#/definitions/String" }
      }
    },

    "TypeAliasDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "id", "target"],
      "properties": {
        "type": { "const": "typeAlias" },
        "id": { "$ref": "#/definitions/Id" },
        "displayName": { "$ref": "#/definitions/String" },
        "target": { "$ref": "#/definitions/TypeExpr" }
      }
    },

    "ClassDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "id", "members"],
      "properties": {
        "type": { "const": "class" },
        "id": { "$ref": "#/definitions/Id" },
        "displayName": { "$ref": "#/definitions/String" },
        "abstract": { "type": "boolean", "default": false },
        "stereotypes": { "$ref": "#/definitions/StereoList" },
        "members": {
          "type": "array",
          "items": { "$ref": "#/definitions/ClassMember" }
        }
      }
    },

    "InterfaceDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "id", "members"],
      "properties": {
        "type": { "const": "interface" },
        "id": { "$ref": "#/definitions/Id" },
        "displayName": { "$ref": "#/definitions/String" },
        "members": {
          "type": "array",
          "items": { "$ref": "#/definitions/InterfaceMember" }
        }
      }
    },

    "ClassMember": {
      "oneOf": [
        { "$ref": "#/definitions/AttributeDecl" },
        { "$ref": "#/definitions/OperationDecl" },
        { "$ref": "#/definitions/NoteDecl" },
        { "$ref": "#/definitions/TagsDecl" }
      ]
    },

    "InterfaceMember": {
      "oneOf": [
        { "$ref": "#/definitions/OperationDecl" },
        { "$ref": "#/definitions/NoteDecl" },
        { "$ref": "#/definitions/TagsDecl" }
      ]
    },

    "AttributeDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "name", "valueType", "mods"],
      "properties": {
        "type": { "const": "attribute" },
        "name": { "$ref": "#/definitions/Id" },
        "valueType": { "$ref": "#/definitions/TypeExpr" },
        "mods": { "$ref": "#/definitions/AttributeMods" }
      }
    },

    "AttributeMods": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "pk": { "type": "boolean", "default": false },
        "unique": { "type": "boolean", "default": false },
        "nullable": { "type": "boolean", "default": false },
        "generated": {
          "type": "string",
          "enum": ["uuid", "increment", "none"],
          "default": "none"
        },
        "default": {},
        "length": { "type": "integer", "minimum": 1 },
        "precision": { "type": "integer", "minimum": 1 },
        "scale": { "type": "integer", "minimum": 0 },
        "format": { "$ref": "#/definitions/Id" },
        "desc": { "$ref": "#/definitions/String" },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "OperationDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "name", "params"],
      "properties": {
        "type": { "const": "operation" },
        "name": { "$ref": "#/definitions/Id" },
        "params": {
          "type": "array",
          "items": { "$ref": "#/definitions/ParamDecl" }
        },
        "returns": { "$ref": "#/definitions/TypeExpr" },
        "desc": { "$ref": "#/definitions/String" },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "ParamDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "valueType"],
      "properties": {
        "name": { "$ref": "#/definitions/Id" },
        "valueType": { "$ref": "#/definitions/TypeExpr" },
        "optional": { "type": "boolean", "default": false }
      }
    },

    "RelationDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "relKind", "left", "right"],
      "properties": {
        "type": { "const": "relation" },
        "relKind": {
          "type": "string",
          "enum": ["assoc", "agg", "comp", "inherit", "impl", "dep"]
        },
        "left": { "$ref": "#/definitions/RelationSide" },
        "right": { "$ref": "#/definitions/RelationSide" },
        "name": { "$ref": "#/definitions/Id" },
        "desc": { "$ref": "#/definitions/String" },
        "nav": {
          "type": "string",
          "enum": ["lr", "rl", "bi"],
          "default": "bi"
        }
      }
    },

    "RelationSide": {
      "type": "object",
      "additionalProperties": false,
      "required": ["classId"],
      "properties": {
        "classId": { "$ref": "#/definitions/Id" },
        "role": { "$ref": "#/definitions/Id" },
        "card": {
          "type": "string",
          "pattern": "^(0|1|\\*|0\\.\\.\\*|1\\.\\.\\*|0\\.\\.1|1\\.\\.1)$"
        }
      }
    },

    "TypeExpr": {
      "oneOf": [
        { "$ref": "#/definitions/TypePrim" },
        { "$ref": "#/definitions/TypeNamed" },
        { "$ref": "#/definitions/TypeDecimal" },
        { "$ref": "#/definitions/TypeArray" },
        { "$ref": "#/definitions/TypeSet" },
        { "$ref": "#/definitions/TypeMap" }
      ]
    },

    "TypePrim": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "name"],
      "properties": {
        "kind": { "const": "prim" },
        "name": {
          "type": "string",
          "enum": [
            "string",
            "text",
            "boolean",
            "int",
            "bigint",
            "float",
            "decimal",
            "uuid",
            "date",
            "datetime",
            "json",
            "bytes",
            "void"
          ]
        }
      }
    },

    "TypeNamed": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "name"],
      "properties": {
        "kind": { "const": "named" },
        "name": { "$ref": "#/definitions/String" }
      }
    },

    "TypeDecimal": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "precision", "scale"],
      "properties": {
        "kind": { "const": "decimal" },
        "precision": { "type": "integer", "minimum": 1 },
        "scale": { "type": "integer", "minimum": 0 }
      }
    },

    "TypeArray": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "of"],
      "properties": {
        "kind": { "const": "array" },
        "of": { "$ref": "#/definitions/TypeExpr" }
      }
    },

    "TypeSet": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "of"],
      "properties": {
        "kind": { "const": "set" },
        "of": { "$ref": "#/definitions/TypeExpr" }
      }
    },

    "TypeMap": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "key", "value"],
      "properties": {
        "kind": { "const": "map" },
        "key": { "$ref": "#/definitions/TypeExpr" },
        "value": { "$ref": "#/definitions/TypeExpr" }
      }
    },

    "ComponentDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "id", "compType"],
      "properties": {
        "type": { "const": "component" },
        "id": { "$ref": "#/definitions/Id" },
        "displayName": { "$ref": "#/definitions/String" },
        "compType": {
          "type": "string",
          "enum": [
            "service",
            "gateway",
            "worker",
            "db",
            "cache",
            "queue",
            "eventBus",
            "storage",
            "search",
            "external",
            "library"
          ]
        },
        "tech": {
          "type": "object",
          "additionalProperties": false,
          "required": ["name"],
          "properties": {
            "name": { "$ref": "#/definitions/Id" },
            "version": { "$ref": "#/definitions/Id" }
          }
        },
        "caps": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "acid",
              "transactions",
              "eventSourcing",
              "cqrs",
              "idempotency",
              "rateLimiting",
              "caching",
              "pubsub",
              "dlq",
              "outbox"
            ]
          }
        },
        "stereotypes": { "$ref": "#/definitions/StereoList" },
        "tags": { "$ref": "#/definitions/TagList" },
        "desc": { "$ref": "#/definitions/String" }
      }
    },

    "LinkDecl": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "from", "to"],
      "properties": {
        "type": { "const": "link" },
        "from": { "$ref": "#/definitions/Id" },
        "to": { "$ref": "#/definitions/Id" },
        "via": {
          "type": "string",
          "enum": [
            "http",
            "grpc",
            "db",
            "cache",
            "queue",
            "event",
            "file",
            "inproc"
          ],
          "default": "http"
        },
        "dir": {
          "type": "string",
          "enum": ["uni", "bi"],
          "default": "uni"
        },
        "label": { "$ref": "#/definitions/String" },
        "desc": { "$ref": "#/definitions/String" }
      }
    }
  }
}
```

---

## B) Complete PEG grammar (peggy) for ClassDSL + ComponentDSL

This grammar produces the AST shape above. It’s **single-file** and supports both modes.

> Notes:
>
> - It’s whitespace/comment tolerant.
> - It treats _keywords as uppercase_ for clarity, but you can relax that.
> - It parses **one file kind at a time**: you choose `StartClass` or `StartComponent`.

```pegjs
{
  // Helpers used in semantic actions
  function flatten(arr) { return arr.flat ? arr.flat() : [].concat.apply([], arr); }
  function pickDisplay(id, display) { return display != null ? display : null; }
  function stripQuotes(s) { return s; } // STRING returns unescaped already
  function asTags(x) { return x || []; }

  function mkRoot(kind, statements) {
    return { version: "1.0.0", kind, statements: statements.filter(Boolean) };
  }

  function mkPrim(name) { return { kind: "prim", name }; }
  function mkNamed(name) { return { kind: "named", name }; }
  function mkDec(p, s) { return { kind: "decimal", precision: p, scale: s }; }
  function mkArray(of) { return { kind: "array", of }; }
  function mkSet(of) { return { kind: "set", of }; }
  function mkMap(k, v) { return { kind: "map", key: k, value: v }; }

  function mkAttr(name, valueType, mods) {
    return { type: "attribute", name, valueType, mods: mods || {} };
  }

  function mkOp(name, params, returns, desc, tags) {
    const op = { type: "operation", name, params: params || [] };
    if (returns) op.returns = returns;
    if (desc) op.desc = desc;
    if (tags && tags.length) op.tags = tags;
    return op;
  }
}

StartClass
  = _ stmts:ClassStatementList _ EOF {
      return mkRoot("class", stmts);
    }

StartComponent
  = _ stmts:ComponentStatementList _ EOF {
      return mkRoot("component", stmts);
    }

EOF = !.

///////////////////////////////////////////////////////////////////////////
// Shared: whitespace/comments/lexemes
///////////////////////////////////////////////////////////////////////////

_ = (WS / Comment)*

WS = [ \t\r\n]+

Comment
  = ("#" (![\n] .)* ("\n" / EOF))
  / ("//" (![\n] .)* ("\n" / EOF))

KW(s)
  = s ![A-Za-z0-9_\-\.]

ID
  = $([A-Za-z][A-Za-z0-9_\-\.]*)

INT
  = $([0-9]+) { return parseInt(text(), 10); }

STRING
  = "\"" chars:Char* "\"" { return chars.join(""); }

Char
  = "\\\"" { return "\""; }
  / "\\n"  { return "\n"; }
  / "\\t"  { return "\t"; }
  / "\\\\" { return "\\"; }
  / !["\\] . { return text(); }

CommaSepIds
  = first:ID rest:(_ "," _ ID)* {
      return [first].concat(rest.map(r => r[3]));
    }

///////////////////////////////////////////////////////////////////////////
// CLASS DSL
///////////////////////////////////////////////////////////////////////////

ClassStatementList
  = stmts:(ClassStatement _)* { return stmts.map(s => s[0]).filter(Boolean); }

ClassStatement
  = PackageDecl
  / ImportDecl
  / EnumDecl
  / TypeAliasDecl
  / ClassDecl
  / InterfaceDecl
  / RelationDecl
  / NoteDecl
  / TagsDecl

ImportDecl
  = "IMPORT" _ path:STRING {
      return { type: "import", path };
    }

NoteDecl
  = "NOTE" _ text:STRING {
      return { type: "note", text };
    }

TagsDecl
  = "TAGS" _ ":" _ tags:CommaSepIds {
      return { type: "tags", tags };
    }

PackageDecl
  = "PACKAGE" _ id:ID _ dn:OptionalString _ "{" _ body:ClassStatementList _ "}" {
      return { type: "package", id, displayName: pickDisplay(id, dn), body };
    }

OptionalString
  = s:STRING { return s; }
  / { return null; }

EnumDecl
  = "ENUM" _ id:ID _ dn:OptionalString _ "{" _ vals:EnumValueList _ "}" {
      return { type: "enum", id, displayName: pickDisplay(id, dn), values: vals };
    }

EnumValueList
  = first:EnumValue rest:(_ "," _ EnumValue)* {
      return [first].concat(rest.map(r => r[3]));
    }

EnumValue
  = id:ID _ desc:OptionalEnumDesc {
      const v = { id };
      if (desc != null) v.description = desc;
      return v;
    }

OptionalEnumDesc
  = _ ":" _ s:STRING { return s; }
  / { return null; }

TypeAliasDecl
  = "TYPE" _ id:ID _ dn:OptionalString _ "=" _ t:TypeExpr {
      return { type: "typeAlias", id, displayName: pickDisplay(id, dn), target: t };
    }

ClassDecl
  = "CLASS" _ id:ID _ dn:OptionalString _ hdr:ClassHeader? _ "{" _ members:ClassMembers _ "}" {
      const out = { type: "class", id, displayName: pickDisplay(id, dn), members };
      if (hdr && hdr.abstract) out.abstract = true;
      if (hdr && hdr.stereotypes && hdr.stereotypes.length) out.stereotypes = hdr.stereotypes;
      return out;
    }

ClassHeader
  = h:(HeaderStereoFirst / HeaderAbstractFirst) { return h; }

HeaderStereoFirst
  = "STEREOTYPES" _ ":" _ st:CommaSepIds _ abs:("ABSTRACT" _)? {
      return { stereotypes: st, abstract: !!abs };
    }

HeaderAbstractFirst
  = "ABSTRACT" _ st:("STEREOTYPES" _ ":" _ CommaSepIds _)? {
      return { abstract: true, stereotypes: st ? st[4] : [] };
    }

ClassMembers
  = items:(ClassMember _)* { return items.map(x => x[0]).filter(Boolean); }

ClassMember
  = AttributeDecl
  / OperationDecl
  / NoteDecl
  / TagsDecl

InterfaceDecl
  = "INTERFACE" _ id:ID _ dn:OptionalString _ "{" _ members:InterfaceMembers _ "}" {
      const out = { type: "interface", id, displayName: pickDisplay(id, dn), members };
      return out;
    }

InterfaceMembers
  = items:(InterfaceMember _)* { return items.map(x => x[0]).filter(Boolean); }

InterfaceMember
  = OperationDecl
  / NoteDecl
  / TagsDecl

AttributeDecl
  = name:ID _ ":" _ t:TypeExpr mods:AttributeMods {
      return mkAttr(name, t, mods);
    }

AttributeMods
  = _ mods:AttributeMod* {
      // merge mods into an object
      const o = {};
      for (const m of mods) {
        if (!m) continue;
        // boolean flags
        if (m.kind === "flag") o[m.name] = true;
        else if (m.kind === "kv") o[m.name] = m.value;
      }
      // defaults are applied later; keep AST minimal
      return o;
    }

AttributeMod
  = _ "pk" { return { kind: "flag", name: "pk" }; }
  / _ "unique" { return { kind: "flag", name: "unique" }; }
  / _ "nullable" { return { kind: "flag", name: "nullable" }; }
  / _ "generated" _ "(" _ g:GenStrategy _ ")" { return { kind: "kv", name: "generated", value: g }; }
  / _ "default" _ "(" _ d:DefaultValue _ ")" { return { kind: "kv", name: "default", value: d }; }
  / _ "length" _ "(" _ n:INT _ ")" { return { kind: "kv", name: "length", value: n }; }
  / _ "precision" _ "(" _ n:INT _ ")" { return { kind: "kv", name: "precision", value: n }; }
  / _ "scale" _ "(" _ n:INT _ ")" { return { kind: "kv", name: "scale", value: n }; }
  / _ "format" _ "(" _ f:ID _ ")" { return { kind: "kv", name: "format", value: f }; }
  / _ "desc" _ "(" _ s:STRING _ ")" { return { kind: "kv", name: "desc", value: s }; }
  / _ "tags" _ "(" _ t:CommaSepIds _ ")" { return { kind: "kv", name: "tags", value: t }; }

GenStrategy
  = "uuid" { return "uuid"; }
  / "increment" { return "increment"; }
  / "none" { return "none"; }

DefaultValue
  = s:STRING { return s; }
  / n:INT { return n; }
  / b:("true" / "false") { return b === "true"; }
  / "null" { return null; }

OperationDecl
  = "OP" _ name:ID _ "(" _ params:ParamList? _ ")" _ ret:ReturnType? mods:OpMods {
      const p = params || [];
      const returns = ret ? ret : null;
      const desc = mods.desc || null;
      const tags = mods.tags || [];
      return mkOp(name, p, returns, desc, tags);
    }

ParamList
  = first:Param rest:(_ "," _ Param)* {
      return [first].concat(rest.map(r => r[3]));
    }

Param
  = name:ID _ ":" _ t:TypeExpr opt:(_ "?" )? {
      return { name, valueType: t, optional: !!opt };
    }

ReturnType
  = _ ":" _ t:TypeExpr { return t; }

OpMods
  = _ mods:OpMod* {
      const o = {};
      for (const m of mods) {
        if (m.name === "desc") o.desc = m.value;
        if (m.name === "tags") o.tags = m.value;
      }
      return o;
    }

OpMod
  = _ "desc" _ "(" _ s:STRING _ ")" { return { name: "desc", value: s }; }
  / _ "tags" _ "(" _ t:CommaSepIds _ ")" { return { name: "tags", value: t }; }

RelationDecl
  = "REL" _ k:RelKind _ l:RelSide _ "--" _ r:RelSide _ nav:NavSpec? _ nm:RelName? _ d:RelDesc? {
      // nav default: bi
      const navVal = nav || "bi";
      const out = { type: "relation", relKind: k, left: l, right: r, nav: navVal };
      if (nm) out.name = nm;
      if (d) out.desc = d;
      return out;
    }

RelKind
  = "assoc" { return "assoc"; }
  / "agg" { return "agg"; }
  / "comp" { return "comp"; }
  / "inherit" { return "inherit"; }
  / "impl" { return "impl"; }
  / "dep" { return "dep"; }

RelSide
  = cid:ID role:RelRole? card:RelCard? {
      const s = { classId: cid };
      if (role) s.role = role;
      if (card) s.card = card;
      return s;
    }

RelRole
  = _ "(" _ r:ID _ ")" { return r; }

RelCard
  = _ "[" _ c:CARD _ "]" { return c; }

CARD
  = "0..*" / "1..*" / "0..1" / "1..1" / "0" / "1" / "*"

NavSpec
  = _ ">" { return "lr"; }
  / _ "<" { return "rl"; }
  / _ "<>" { return "bi"; }

RelName
  = _ ":" _ n:ID { return n; }

RelDesc
  = _ "desc" _ "(" _ s:STRING _ ")" { return s; }

TypeExpr
  = TypeMap
  / TypeArray
  / TypeSet
  / TypeDecimal
  / TypePrim
  / TypeNamed

TypePrim
  = p:PRIM { return mkPrim(p); }

PRIM
  = "string" / "text" / "boolean" / "int" / "bigint" / "float" / "decimal" / "uuid"
  / "date" / "datetime" / "json" / "bytes" / "void"

TypeDecimal
  = "decimal" _ "(" _ p:INT _ "," _ s:INT _ ")" { return mkDec(p, s); }

TypeArray
  = "array" _ "<" _ t:TypeExpr _ ">" { return mkArray(t); }

TypeSet
  = "set" _ "<" _ t:TypeExpr _ ">" { return mkSet(t); }

TypeMap
  = "map" _ "<" _ k:TypeExpr _ "," _ v:TypeExpr _ ">" { return mkMap(k, v); }

TypeNamed
  = n:QualifiedId { return mkNamed(n); }

QualifiedId
  = first:ID rest:(_ "." _ ID)* {
      return [first].concat(rest.map(r => r[3])).join(".");
    }

///////////////////////////////////////////////////////////////////////////
// COMPONENT DSL
///////////////////////////////////////////////////////////////////////////

ComponentStatementList
  = stmts:(ComponentStatement _)* { return stmts.map(s => s[0]).filter(Boolean); }

ComponentStatement
  = ComponentDecl
  / LinkDecl
  / NoteDecl
  / TagsDecl
  / ImportDecl

ComponentDecl
  = "COMPONENT" _ id:ID _ dn:OptionalString _
    "TYPE" _ ct:ComponentType _
    tech:TechPart? _
    caps:CapsPart? _
    stereos:StereosPart? _
    tags:TagsInlinePart? _
    desc:DescPart?
    {
      const out = { type: "component", id, displayName: pickDisplay(id, dn), compType: ct };
      if (tech) out.tech = tech;
      if (caps && caps.length) out.caps = caps;
      if (stereos && stereos.length) out.stereotypes = stereos;
      if (tags && tags.length) out.tags = tags;
      if (desc) out.desc = desc;
      return out;
    }

ComponentType
  = "service" / "gateway" / "worker" / "db" / "cache" / "queue" / "eventBus"
  / "storage" / "search" / "external" / "library"

TechPart
  = _ "TECH" _ t:TechSpec { return t; }

TechSpec
  = name:ID ver:(_ "@" _ ID)? {
      const o = { name };
      if (ver) o.version = ver[3];
      return o;
    }

CapsPart
  = _ "CAPS" _ ":" _ list:CapList { return list; }

CapList
  = first:Cap rest:(_ "," _ Cap)* {
      return [first].concat(rest.map(r => r[3]));
    }

Cap
  = "acid" / "transactions" / "eventSourcing" / "cqrs" / "idempotency" / "rateLimiting"
  / "caching" / "pubsub" / "dlq" / "outbox"

StereosPart
  = _ "STEREOTYPES" _ ":" _ list:CommaSepIds { return list; }

TagsInlinePart
  = _ "TAGS" _ ":" _ list:CommaSepIds { return list; }

DescPart
  = _ "DESC" _ s:STRING { return s; }

LinkDecl
  = "LINK" _ from:ID _ "->" _ to:ID _
    via:ViaPart? _
    dir:DirPart? _
    label:LabelPart? _
    desc:DescPart?
    {
      const out = { type: "link", from, to };
      if (via) out.via = via;
      if (dir) out.dir = dir;
      if (label) out.label = label;
      if (desc) out.desc = desc;
      return out;
    }

ViaPart
  = "VIA" _ lt:LinkType { return lt; }

LinkType
  = "http" / "grpc" / "db" / "cache" / "queue" / "event" / "file" / "inproc"

DirPart
  = "DIR" _ d:("uni" / "bi") { return d; }

LabelPart
  = "LABEL" _ s:STRING { return s; }
```

---

## How you wire this into your MCP

- **Tool** `uml_parse_ascii`:
  - chooses grammar entry: `StartClass` or `StartComponent`
  - outputs AST (validated against AST schema above)

- **Tool** `uml_ast_to_ir`:
  - resolves names to DiagramIR:
    - packages → `classModel.packages[]`
    - enums/types/classes/interfaces → elements
    - relations → `classModel.relations[]`
    - components/links → `component.components[]`/`component.links[]`

- **Tool** `uml_validate_ir`:
  - schema validate (DiagramIR schema you already requested)
  - semantic validate (name resolution, duplicates, missing ids, etc.)

---

If you want the next deliverable, I’ll provide **the AST → DiagramIR mapping spec** (rules + edge cases: qualified names, default nav, default displayName, decimal handling, `void` return types, etc.) so implementation is unambiguous.
