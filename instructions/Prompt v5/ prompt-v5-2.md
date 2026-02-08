```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://10kgoal.dev/schemas/diagram-ir-v1.schema.json",
  "title": "DiagramIR v1",
  "description": "Intermediate representation for UML-like diagrams (use case, class model, component, sequence) used to generate Archon DesignSpec v1.",
  "type": "object",
  "additionalProperties": false,
  "required": ["version", "meta", "diagrams"],
  "properties": {
    "version": {
      "type": "string",
      "const": "1.0.0",
      "description": "DiagramIR schema version. Must be 1.0.0 for v1."
    },
    "meta": {
      "$ref": "#/definitions/Meta"
    },
    "diagrams": {
      "$ref": "#/definitions/Diagrams"
    }
  },

  "definitions": {
    "Meta": {
      "type": "object",
      "additionalProperties": false,
      "required": ["projectName", "source"],
      "properties": {
        "projectName": { "type": "string", "minLength": 1 },
        "description": { "type": "string" },
        "source": {
          "type": "object",
          "additionalProperties": false,
          "required": ["kind"],
          "properties": {
            "kind": {
              "type": "string",
              "enum": ["ascii", "image", "nl", "import", "mixed"],
              "description": "Primary origin of this IR."
            },
            "artifactId": {
              "type": "string",
              "description": "Optional pointer to upstream artifact (file hash, URL, etc.)."
            },
            "notes": { "type": "string" }
          }
        },
        "authors": {
          "type": "array",
          "items": { "type": "string" }
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },

    "Diagrams": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "useCase": { "$ref": "#/definitions/UseCaseDiagram" },
        "classModel": { "$ref": "#/definitions/ClassModelDiagram" },
        "component": { "$ref": "#/definitions/ComponentDiagram" },
        "sequence": { "$ref": "#/definitions/SequenceDiagram" }
      },
      "minProperties": 1,
      "description": "Container for one or more diagrams. At least one must be present."
    },

    "Id": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[A-Za-z][A-Za-z0-9_\\-\\.]*$",
      "description": "Stable identifier token. Start with letter; allow alnum, underscore, dash, dot."
    },

    "DisplayName": {
      "type": "string",
      "minLength": 1
    },

    "Ref": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "id"],
      "properties": {
        "kind": {
          "type": "string",
          "enum": [
            "actor",
            "useCase",
            "package",
            "class",
            "interface",
            "enum",
            "typeAlias",
            "component",
            "lifeline",
            "message",
            "fragment"
          ]
        },
        "id": { "$ref": "#/definitions/Id" }
      }
    },

    "Doc": {
      "type": "string",
      "description": "Freeform documentation text."
    },

    "TagList": {
      "type": "array",
      "items": { "type": "string" }
    },

    "Stereotypes": {
      "type": "array",
      "items": { "$ref": "#/definitions/Id" },
      "description": "UML-like stereotypes, e.g., entity, aggregate, valueObject, service."
    },

    "Location": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "diagram": {
          "type": "string",
          "enum": ["useCase", "classModel", "component", "sequence"]
        },
        "hint": {
          "type": "string",
          "description": "Optional source mapping hint (line range, node id, etc.)."
        }
      }
    },

    "UseCaseDiagram": {
      "type": "object",
      "additionalProperties": false,
      "required": ["actors", "useCases"],
      "properties": {
        "title": { "$ref": "#/definitions/DisplayName" },
        "actors": {
          "type": "array",
          "items": { "$ref": "#/definitions/Actor" },
          "uniqueItems": false
        },
        "useCases": {
          "type": "array",
          "items": { "$ref": "#/definitions/UseCase" }
        },
        "relations": {
          "type": "array",
          "items": { "$ref": "#/definitions/UseCaseRelation" },
          "description": "Include/extend/association relations between actors and use cases."
        },
        "notes": { "$ref": "#/definitions/Doc" }
      }
    },

    "Actor": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "name"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "description": { "$ref": "#/definitions/Doc" },
        "stereotypes": { "$ref": "#/definitions/Stereotypes" },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "UseCase": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "name"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "description": { "$ref": "#/definitions/Doc" },
        "primaryActorId": { "$ref": "#/definitions/Id" },
        "preconditions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "postconditions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "successScenario": {
          "type": "array",
          "items": { "type": "string" }
        },
        "extensions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "mapsTo": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "domain": { "$ref": "#/definitions/Id" },
            "service": { "$ref": "#/definitions/Id" },
            "operation": { "$ref": "#/definitions/Id" }
          },
          "description": "Optional mapping hints for spec generation."
        },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "UseCaseRelation": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "from", "to"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["association", "include", "extend", "generalization"]
        },
        "from": { "$ref": "#/definitions/Ref" },
        "to": { "$ref": "#/definitions/Ref" },
        "label": { "type": "string" },
        "location": { "$ref": "#/definitions/Location" }
      }
    },

    "ClassModelDiagram": {
      "type": "object",
      "additionalProperties": false,
      "required": ["packages"],
      "properties": {
        "title": { "$ref": "#/definitions/DisplayName" },
        "packages": {
          "type": "array",
          "items": { "$ref": "#/definitions/Package" },
          "minItems": 1
        },
        "types": {
          "type": "array",
          "items": { "$ref": "#/definitions/TypeAlias" },
          "description": "Optional global type aliases, e.g., Email:string, Money:decimal(12,2)"
        },
        "enums": {
          "type": "array",
          "items": { "$ref": "#/definitions/EnumType" },
          "description": "Optional global enums."
        },
        "relations": {
          "type": "array",
          "items": { "$ref": "#/definitions/ClassRelation" },
          "description": "Relations that may be declared outside class blocks."
        },
        "notes": { "$ref": "#/definitions/Doc" }
      }
    },

    "Package": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "name", "elements"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "description": { "$ref": "#/definitions/Doc" },
        "elements": {
          "type": "array",
          "items": { "$ref": "#/definitions/PackageElement" },
          "minItems": 1
        },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "PackageElement": {
      "oneOf": [
        { "$ref": "#/definitions/ClassType" },
        { "$ref": "#/definitions/InterfaceType" },
        { "$ref": "#/definitions/EnumType" },
        { "$ref": "#/definitions/TypeAlias" }
      ]
    },

    "ClassType": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "id", "name", "attributes"],
      "properties": {
        "kind": { "const": "class" },
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "abstract": { "type": "boolean", "default": false },
        "stereotypes": { "$ref": "#/definitions/Stereotypes" },
        "description": { "$ref": "#/definitions/Doc" },
        "attributes": {
          "type": "array",
          "items": { "$ref": "#/definitions/Attribute" }
        },
        "operations": {
          "type": "array",
          "items": { "$ref": "#/definitions/Operation" },
          "description": "Optional class operations. Typically used for domain methods, but may be ignored in spec generation."
        },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "InterfaceType": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "id", "name", "operations"],
      "properties": {
        "kind": { "const": "interface" },
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "description": { "$ref": "#/definitions/Doc" },
        "operations": {
          "type": "array",
          "items": { "$ref": "#/definitions/Operation" }
        },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "TypeAlias": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "id", "name", "target"],
      "properties": {
        "kind": { "const": "typeAlias" },
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "description": { "$ref": "#/definitions/Doc" },
        "target": { "$ref": "#/definitions/TypeRef" },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "EnumType": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "id", "name", "values"],
      "properties": {
        "kind": { "const": "enum" },
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "description": { "$ref": "#/definitions/Doc" },
        "values": {
          "type": "array",
          "items": { "$ref": "#/definitions/EnumValue" },
          "minItems": 1
        },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "EnumValue": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "name"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "description": { "$ref": "#/definitions/Doc" }
      }
    },

    "Attribute": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "type"],
      "properties": {
        "name": { "$ref": "#/definitions/Id" },
        "type": { "$ref": "#/definitions/TypeRef" },
        "visibility": {
          "type": "string",
          "enum": ["public", "private", "protected", "package"],
          "default": "public"
        },
        "nullable": { "type": "boolean", "default": false },
        "unique": { "type": "boolean", "default": false },
        "primaryKey": { "type": "boolean", "default": false },
        "generated": {
          "type": "string",
          "enum": ["uuid", "increment", "none"],
          "default": "none"
        },
        "default": {},
        "length": { "type": "integer", "minimum": 1 },
        "precision": { "type": "integer", "minimum": 1 },
        "scale": { "type": "integer", "minimum": 0 },
        "description": { "$ref": "#/definitions/Doc" },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "Operation": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name"],
      "properties": {
        "name": { "$ref": "#/definitions/Id" },
        "description": { "$ref": "#/definitions/Doc" },
        "params": {
          "type": "array",
          "items": { "$ref": "#/definitions/Param" }
        },
        "returns": { "$ref": "#/definitions/TypeRef" },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "Param": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "type"],
      "properties": {
        "name": { "$ref": "#/definitions/Id" },
        "type": { "$ref": "#/definitions/TypeRef" },
        "optional": { "type": "boolean", "default": false },
        "description": { "$ref": "#/definitions/Doc" }
      }
    },

    "TypeRef": {
      "description": "A reference to a primitive or named type, with optional collection wrapper.",
      "oneOf": [
        { "$ref": "#/definitions/PrimitiveTypeRef" },
        { "$ref": "#/definitions/NamedTypeRef" },
        { "$ref": "#/definitions/CollectionTypeRef" }
      ]
    },

    "PrimitiveTypeRef": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "name"],
      "properties": {
        "kind": { "const": "primitive" },
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
            "bytes"
          ]
        },
        "format": {
          "type": "string",
          "description": "Optional format hint, e.g., email, uri, phone, iso8601."
        }
      }
    },

    "NamedTypeRef": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "ref"],
      "properties": {
        "kind": { "const": "named" },
        "ref": {
          "type": "object",
          "additionalProperties": false,
          "required": ["kind", "id"],
          "properties": {
            "kind": {
              "type": "string",
              "enum": ["class", "interface", "enum", "typeAlias"]
            },
            "id": { "$ref": "#/definitions/Id" }
          }
        }
      }
    },

    "CollectionTypeRef": {
      "type": "object",
      "additionalProperties": false,
      "required": ["kind", "of"],
      "properties": {
        "kind": { "const": "collection" },
        "collection": {
          "type": "string",
          "enum": ["array", "set", "map"],
          "default": "array"
        },
        "keyType": {
          "description": "Required if collection=map. Otherwise ignored.",
          "$ref": "#/definitions/TypeRef"
        },
        "of": { "$ref": "#/definitions/TypeRef" }
      },
      "allOf": [
        {
          "if": { "properties": { "collection": { "const": "map" } } },
          "then": { "required": ["keyType"] }
        }
      ]
    },

    "Cardinality": {
      "type": "string",
      "pattern": "^(0|1|\\*|0\\.\\.\\*|1\\.\\.\\*|0\\.\\.1|1\\.\\.1)$",
      "description": "Allowed multiplicities: 0,1,*,0..*,1..*,0..1,1..1"
    },

    "ClassRelation": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "from", "to"],
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "association",
            "aggregation",
            "composition",
            "inheritance",
            "implementation",
            "dependency"
          ]
        },
        "from": { "$ref": "#/definitions/RefClassSide" },
        "to": { "$ref": "#/definitions/RefClassSide" },
        "name": {
          "type": "string",
          "description": "Optional relation name/role."
        },
        "description": { "$ref": "#/definitions/Doc" },
        "location": { "$ref": "#/definitions/Location" }
      }
    },

    "RefClassSide": {
      "type": "object",
      "additionalProperties": false,
      "required": ["classId"],
      "properties": {
        "classId": { "$ref": "#/definitions/Id" },
        "role": { "$ref": "#/definitions/Id" },
        "cardinality": { "$ref": "#/definitions/Cardinality" },
        "navigable": { "type": "boolean", "default": true }
      }
    },

    "ComponentDiagram": {
      "type": "object",
      "additionalProperties": false,
      "required": ["components", "links"],
      "properties": {
        "title": { "$ref": "#/definitions/DisplayName" },
        "components": {
          "type": "array",
          "items": { "$ref": "#/definitions/Component" },
          "minItems": 1
        },
        "links": {
          "type": "array",
          "items": { "$ref": "#/definitions/ComponentLink" }
        },
        "notes": { "$ref": "#/definitions/Doc" }
      }
    },

    "Component": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "name", "type"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "type": {
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
        "stereotypes": { "$ref": "#/definitions/Stereotypes" },
        "description": { "$ref": "#/definitions/Doc" },
        "tech": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "name": {
              "type": "string",
              "description": "Technology name, e.g., postgres, redis, bullmq, kafka."
            },
            "version": { "type": "string" },
            "config": {
              "type": "object",
              "additionalProperties": true,
              "description": "Arbitrary config hints. Validator may enforce rules in semantic validation."
            }
          }
        },
        "capabilities": {
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
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "ComponentLink": {
      "type": "object",
      "additionalProperties": false,
      "required": ["from", "to"],
      "properties": {
        "from": { "$ref": "#/definitions/Id" },
        "to": { "$ref": "#/definitions/Id" },
        "type": {
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
        "direction": {
          "type": "string",
          "enum": ["uni", "bi"],
          "default": "uni"
        },
        "label": { "type": "string" },
        "description": { "$ref": "#/definitions/Doc" },
        "location": { "$ref": "#/definitions/Location" }
      }
    },

    "SequenceDiagram": {
      "type": "object",
      "additionalProperties": false,
      "required": ["lifelines", "messages"],
      "properties": {
        "title": { "$ref": "#/definitions/DisplayName" },
        "lifelines": {
          "type": "array",
          "items": { "$ref": "#/definitions/Lifeline" },
          "minItems": 1
        },
        "messages": {
          "type": "array",
          "items": { "$ref": "#/definitions/Message" },
          "minItems": 1
        },
        "fragments": {
          "type": "array",
          "items": { "$ref": "#/definitions/Fragment" },
          "description": "Optional control fragments (alt/opt/loop/par)."
        },
        "notes": { "$ref": "#/definitions/Doc" }
      }
    },

    "Lifeline": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "name"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "kind": {
          "type": "string",
          "enum": [
            "actor",
            "component",
            "service",
            "external",
            "db",
            "queue",
            "cache"
          ],
          "default": "component"
        },
        "ref": {
          "description": "Optional pointer to element in other diagrams (e.g., component id).",
          "oneOf": [{ "type": "null" }, { "$ref": "#/definitions/Ref" }]
        },
        "tags": { "$ref": "#/definitions/TagList" }
      }
    },

    "Message": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "from", "to", "name"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "from": { "$ref": "#/definitions/Id" },
        "to": { "$ref": "#/definitions/Id" },
        "name": { "$ref": "#/definitions/DisplayName" },
        "type": {
          "type": "string",
          "enum": ["sync", "async", "return", "create", "destroy"],
          "default": "sync"
        },
        "payload": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "schema": {
              "type": "string",
              "description": "Optional JSON Schema reference for message payload."
            },
            "example": {
              "type": "object",
              "additionalProperties": true
            }
          }
        },
        "mapsTo": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "domain": { "$ref": "#/definitions/Id" },
            "service": { "$ref": "#/definitions/Id" },
            "operation": { "$ref": "#/definitions/Id" }
          },
          "description": "Optional mapping hints for spec generation."
        },
        "description": { "$ref": "#/definitions/Doc" },
        "tags": { "$ref": "#/definitions/TagList" },
        "location": { "$ref": "#/definitions/Location" }
      }
    },

    "Fragment": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "type", "range"],
      "properties": {
        "id": { "$ref": "#/definitions/Id" },
        "type": {
          "type": "string",
          "enum": ["alt", "opt", "loop", "par", "break", "critical"]
        },
        "guard": {
          "type": "string",
          "description": "Condition/guard for alt/opt."
        },
        "range": {
          "type": "object",
          "additionalProperties": false,
          "required": ["startMessageId", "endMessageId"],
          "properties": {
            "startMessageId": { "$ref": "#/definitions/Id" },
            "endMessageId": { "$ref": "#/definitions/Id" }
          }
        },
        "description": { "$ref": "#/definitions/Doc" }
      }
    }
  }
}
```
