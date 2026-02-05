Below is a **practical DesignSpec v1** you can use as the **single source of truth** for: docs, diagrams, NestJS scaffold, Postman/OpenAPI, and infra skeleton.

It’s designed to be:

* **strict** (JSON Schema validates it)
* **generator-friendly** (deterministic code output)
* **extensible** (v2 can add more without breaking v1)

---

## 1) DesignSpec v1 JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://archon.dev/schemas/designspec.v1.json",
  "title": "DesignSpec v1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "version",
    "project",
    "stack",
    "constraints",
    "domains",
    "crossCutting",
    "deliverables"
  ],
  "properties": {
    "version": {
      "type": "string",
      "const": "1.0.0"
    },
    "project": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "description", "primaryUseCase"],
      "properties": {
        "name": { "type": "string", "minLength": 2, "maxLength": 80 },
        "description": { "type": "string", "minLength": 10, "maxLength": 2000 },
        "primaryUseCase": { "type": "string", "minLength": 10, "maxLength": 2000 },
        "actors": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["key", "label"],
            "properties": {
              "key": { "type": "string", "pattern": "^[a-z][a-z0-9_]{1,30}$" },
              "label": { "type": "string", "minLength": 2, "maxLength": 60 }
            }
          },
          "default": []
        }
      }
    },
    "stack": {
      "type": "object",
      "additionalProperties": false,
      "required": ["language", "runtime", "framework", "orm", "db", "testing"],
      "properties": {
        "language": { "type": "string", "enum": ["typescript"] },
        "runtime": { "type": "string", "enum": ["node18", "node20", "node22"] },
        "framework": { "type": "string", "enum": ["nestjs"] },
        "orm": { "type": "string", "enum": ["typeorm", "prisma"] },
        "db": { "type": "string", "enum": ["postgres"] },
        "testing": { "type": "string", "enum": ["jest"] },
        "apiStyle": { "type": "string", "enum": ["rest"] }
      }
    },
    "constraints": {
      "type": "object",
      "additionalProperties": false,
      "required": ["scale", "securityLevel", "compliance"],
      "properties": {
        "scale": {
          "type": "object",
          "additionalProperties": false,
          "required": ["stage", "expectedUsers", "rpsPeak"],
          "properties": {
            "stage": { "type": "string", "enum": ["prototype", "mvp", "production"] },
            "expectedUsers": { "type": "integer", "minimum": 1, "maximum": 100000000 },
            "rpsPeak": { "type": "integer", "minimum": 1, "maximum": 1000000 }
          }
        },
        "securityLevel": { "type": "string", "enum": ["basic", "standard", "high"] },
        "compliance": {
          "type": "array",
          "items": { "type": "string", "enum": ["none", "gdpr", "hipaa", "soc2"] },
          "default": ["none"]
        }
      }
    },
    "domains": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/domain" }
    },
    "crossCutting": {
      "type": "object",
      "additionalProperties": false,
      "required": ["auth", "errors", "observability", "config", "dataPolicies"],
      "properties": {
        "auth": { "$ref": "#/$defs/auth" },
        "errors": { "$ref": "#/$defs/errors" },
        "observability": { "$ref": "#/$defs/observability" },
        "config": { "$ref": "#/$defs/config" },
        "dataPolicies": { "$ref": "#/$defs/dataPolicies" }
      }
    },
    "deliverables": {
      "type": "object",
      "additionalProperties": false,
      "required": ["docs", "diagrams", "code", "postman", "openapi"],
      "properties": {
        "docs": { "type": "boolean", "const": true },
        "diagrams": { "type": "boolean", "const": true },
        "code": { "type": "boolean", "const": true },
        "postman": { "type": "boolean", "default": true },
        "openapi": { "type": "boolean", "default": true }
      }
    }
  },
  "$defs": {
    "domain": {
      "type": "object",
      "additionalProperties": false,
      "required": ["key", "label", "baseRoute", "entities", "services"],
      "properties": {
        "key": { "type": "string", "pattern": "^[a-z][a-z0-9-]{1,40}$" },
        "label": { "type": "string", "minLength": 2, "maxLength": 80 },
        "baseRoute": { "type": "string", "pattern": "^/[a-z0-9-]+$" },
        "entities": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/$defs/entity" },
          "default": []
        },
        "services": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/$defs/service" }
        }
      }
    },
    "entity": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "table", "primaryKey", "fields"],
      "properties": {
        "name": { "type": "string", "pattern": "^[A-Z][A-Za-z0-9]{1,50}$" },
        "table": { "type": "string", "pattern": "^[a-z][a-z0-9_]{1,60}$" },
        "primaryKey": { "type": "string", "pattern": "^[a-z][a-z0-9A-Z]{0,40}$" },
        "fields": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/$defs/field" }
        },
        "indexes": {
          "type": "array",
          "items": { "$ref": "#/$defs/index" },
          "default": []
        },
        "relations": {
          "type": "array",
          "items": { "$ref": "#/$defs/relation" },
          "default": []
        }
      }
    },
    "field": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "type", "required"],
      "properties": {
        "name": { "type": "string", "pattern": "^[a-z][a-zA-Z0-9]{0,40}$" },
        "type": {
          "type": "string",
          "enum": ["uuid", "string", "text", "int", "float", "boolean", "timestamp", "json"]
        },
        "required": { "type": "boolean" },
        "unique": { "type": "boolean", "default": false },
        "default": {},
        "maxLength": { "type": "integer", "minimum": 1, "maximum": 20000 }
      }
    },
    "index": {
      "type": "object",
      "additionalProperties": false,
      "required": ["fields", "unique"],
      "properties": {
        "fields": {
          "type": "array",
          "minItems": 1,
          "items": { "type": "string", "pattern": "^[a-z][a-zA-Z0-9]{0,40}$" }
        },
        "unique": { "type": "boolean" }
      }
    },
    "relation": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type", "target", "field", "targetField"],
      "properties": {
        "type": { "type": "string", "enum": ["manyToOne", "oneToMany", "oneToOne", "manyToMany"] },
        "target": { "type": "string", "pattern": "^[A-Z][A-Za-z0-9]{1,50}$" },
        "field": { "type": "string", "pattern": "^[a-z][a-zA-Z0-9]{0,40}$" },
        "targetField": { "type": "string", "pattern": "^[a-z][a-zA-Z0-9]{0,40}$" },
        "nullable": { "type": "boolean", "default": false }
      }
    },
    "service": {
      "type": "object",
      "additionalProperties": false,
      "required": ["key", "label", "route", "crud", "operations"],
      "properties": {
        "key": { "type": "string", "pattern": "^[a-z][a-z0-9-]{1,50}$" },
        "label": { "type": "string", "minLength": 2, "maxLength": 80 },
        "route": { "type": "string", "pattern": "^/[a-z0-9-/]+$" },
        "crud": {
          "type": "array",
          "items": { "type": "string", "enum": ["create", "findAll", "findOne", "update", "delete"] },
          "default": []
        },
        "operations": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/$defs/operation" },
          "default": []
        }
      }
    },
    "operation": {
      "type": "object",
      "additionalProperties": false,
      "required": ["name", "method", "path", "authz", "request", "response"],
      "properties": {
        "name": { "type": "string", "pattern": "^[a-z][a-z0-9A-Z]{1,60}$" },
        "method": { "type": "string", "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        "path": { "type": "string", "pattern": "^/[a-z0-9-/:]*$" },
        "authz": { "$ref": "#/$defs/authz" },
        "request": { "$ref": "#/$defs/payload" },
        "response": { "$ref": "#/$defs/payload" }
      }
    },
    "auth": {
      "type": "object",
      "additionalProperties": false,
      "required": ["mode", "jwt", "rbac"],
      "properties": {
        "mode": { "type": "string", "enum": ["none", "jwt"] },
        "jwt": {
          "type": "object",
          "additionalProperties": false,
          "required": ["issuer", "audience"],
          "properties": {
            "issuer": { "type": "string", "minLength": 3, "maxLength": 200 },
            "audience": { "type": "string", "minLength": 1, "maxLength": 200 }
          }
        },
        "rbac": {
          "type": "object",
          "additionalProperties": false,
          "required": ["enabled", "roles"],
          "properties": {
            "enabled": { "type": "boolean" },
            "roles": {
              "type": "array",
              "items": { "type": "string", "pattern": "^[a-z][a-z0-9_]{1,30}$" },
              "default": []
            }
          }
        }
      }
    },
    "authz": {
      "type": "object",
      "additionalProperties": false,
      "required": ["required", "rolesAny"],
      "properties": {
        "required": { "type": "boolean" },
        "rolesAny": {
          "type": "array",
          "items": { "type": "string", "pattern": "^[a-z][a-z0-9_]{1,30}$" },
          "default": []
        }
      }
    },
    "errors": {
      "type": "object",
      "additionalProperties": false,
      "required": ["strategy", "map"],
      "properties": {
        "strategy": { "type": "string", "enum": ["http-problem", "simple-json"] },
        "map": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["code", "httpStatus", "message"],
            "properties": {
              "code": { "type": "string", "pattern": "^[A-Z][A-Z0-9_]{2,50}$" },
              "httpStatus": { "type": "integer", "minimum": 400, "maximum": 599 },
              "message": { "type": "string", "minLength": 3, "maxLength": 300 }
            }
          }
        }
      }
    },
    "observability": {
      "type": "object",
      "additionalProperties": false,
      "required": ["logging", "metrics", "tracing"],
      "properties": {
        "logging": { "type": "string", "enum": ["console-json", "pino"] },
        "metrics": { "type": "string", "enum": ["none", "prometheus"] },
        "tracing": { "type": "string", "enum": ["none", "opentelemetry"] }
      }
    },
    "config": {
      "type": "object",
      "additionalProperties": false,
      "required": ["envVars"],
      "properties": {
        "envVars": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["key", "required", "description"],
            "properties": {
              "key": { "type": "string", "pattern": "^[A-Z][A-Z0-9_]{2,60}$" },
              "required": { "type": "boolean" },
              "description": { "type": "string", "minLength": 3, "maxLength": 300 },
              "example": { "type": "string" }
            }
          }
        }
      }
    },
    "dataPolicies": {
      "type": "object",
      "additionalProperties": false,
      "required": ["pii", "retentionDays"],
      "properties": {
        "pii": { "type": "string", "enum": ["none", "low", "medium", "high"] },
        "retentionDays": { "type": "integer", "minimum": 1, "maximum": 36500 }
      }
    },
    "payload": {
      "type": "object",
      "additionalProperties": false,
      "required": ["contentType", "schemaRef"],
      "properties": {
        "contentType": { "type": "string", "enum": ["application/json", "none"] },
        "schemaRef": { "type": "string", "pattern": "^#/(dtos|entities)/[A-Za-z0-9]+$" }
      }
    }
  }
}
```

---

## 2) Example DesignSpec v1 (small, complete)

This example is deliberately “Phase 1 friendly”: one domain, one entity, clean CRUD + one custom operation.

```json
{
  "version": "1.0.0",
  "project": {
    "name": "Archon Demo",
    "description": "Backend scaffold for customer notification settings.",
    "primaryUseCase": "Allow admins to configure notification settings per customer and retrieve them securely.",
    "actors": [
      { "key": "admin", "label": "Admin User" },
      { "key": "service", "label": "Internal Service" }
    ]
  },
  "stack": {
    "language": "typescript",
    "runtime": "node20",
    "framework": "nestjs",
    "orm": "typeorm",
    "db": "postgres",
    "testing": "jest",
    "apiStyle": "rest"
  },
  "constraints": {
    "scale": { "stage": "mvp", "expectedUsers": 2000, "rpsPeak": 50 },
    "securityLevel": "standard",
    "compliance": ["gdpr"]
  },
  "domains": [
    {
      "key": "notifications",
      "label": "Notifications",
      "baseRoute": "/notifications",
      "entities": [
        {
          "name": "NotificationSetting",
          "table": "notification_setting",
          "primaryKey": "id",
          "fields": [
            { "name": "id", "type": "uuid", "required": true, "unique": true },
            { "name": "customerId", "type": "string", "required": true, "unique": true, "maxLength": 64 },
            { "name": "enabled", "type": "boolean", "required": true, "default": true },
            { "name": "portalUrl", "type": "string", "required": false, "maxLength": 512 },
            { "name": "createdAt", "type": "timestamp", "required": true },
            { "name": "updatedAt", "type": "timestamp", "required": true }
          ],
          "indexes": [
            { "fields": ["customerId"], "unique": true }
          ],
          "relations": []
        }
      ],
      "services": [
        {
          "key": "notification-settings",
          "label": "Notification Settings",
          "route": "/notifications/settings",
          "crud": ["create", "findAll", "findOne", "update", "delete"],
          "operations": [
            {
              "name": "toggleEnabled",
              "method": "PATCH",
              "path": "/:id/toggle",
              "authz": { "required": true, "rolesAny": ["admin"] },
              "request": { "contentType": "application/json", "schemaRef": "#/dtos/ToggleEnabledDto" },
              "response": { "contentType": "application/json", "schemaRef": "#/entities/NotificationSetting" }
            }
          ]
        }
      ]
    }
  ],
  "crossCutting": {
    "auth": {
      "mode": "jwt",
      "jwt": { "issuer": "https://issuer.example", "audience": "archon-demo" },
      "rbac": { "enabled": true, "roles": ["admin"] }
    },
    "errors": {
      "strategy": "simple-json",
      "map": [
        { "code": "VALIDATION_FAILED", "httpStatus": 400, "message": "Request validation failed." },
        { "code": "UNAUTHORIZED", "httpStatus": 401, "message": "Missing or invalid token." },
        { "code": "FORBIDDEN", "httpStatus": 403, "message": "Not allowed for this operation." },
        { "code": "NOT_FOUND", "httpStatus": 404, "message": "Resource not found." },
        { "code": "CONFLICT", "httpStatus": 409, "message": "Resource already exists." }
      ]
    },
    "observability": { "logging": "pino", "metrics": "none", "tracing": "none" },
    "config": {
      "envVars": [
        { "key": "PORT", "required": true, "description": "HTTP port", "example": "3000" },
        { "key": "DATABASE_URL", "required": true, "description": "Postgres connection string", "example": "postgres://user:pass@localhost:5432/app" },
        { "key": "JWT_ISSUER", "required": true, "description": "JWT issuer", "example": "https://issuer.example" },
        { "key": "JWT_AUDIENCE", "required": true, "description": "JWT audience", "example": "archon-demo" }
      ]
    },
    "dataPolicies": { "pii": "low", "retentionDays": 3650 }
  },
  "deliverables": {
    "docs": true,
    "diagrams": true,
    "code": true,
    "postman": true,
    "openapi": true
  }
}
```

---

## 3) Mapping DesignSpec → Generated Files

This is what makes your product *not* “ask ChatGPT to build a website”.

### Output folder plan

```text
output/
  designspec.json
  docs/
    architecture.md
    decisions.md
    api.md
  diagrams/
    components.mmd
    domain-notifications.mmd
    sequence-toggleEnabled.mmd
  src/
    main.ts
    app.module.ts
    modules/
      notifications/
        notifications.module.ts
        entities/
          notification-setting.entity.ts
        dtos/
          create-notification-setting.dto.ts
          update-notification-setting.dto.ts
          toggle-enabled.dto.ts
        notification-settings/
          notification-settings.controller.ts
          notification-settings.service.ts
          notification-settings.repository.ts
  postman/
    collection.json
  openapi/
    openapi.json
  infra/
    docker-compose.yml
    Dockerfile
    README.md
```

### Generator rules (deterministic)

* Each **domain** → Nest module under `src/modules/<domainKey>/`
* Each **entity** → TypeORM entity + create/update DTOs
* Each **service** → controller/service/repository
* Each **crud** item → endpoints + DTO mapping
* Each **operation** → explicit endpoint with authz guard annotations
* `crossCutting.auth` → auth module + guards + RBAC decorator
* `crossCutting.errors` → common error response + mapping helpers
* `config.envVars` → `.env.example` + config module

---

## 4) The “v1 discipline” (so you don’t die later)

**Rule:** LLM is allowed to produce only:

* `DesignSpec v1`
* DTO skeleton definitions (if you include them in spec later)

Everything else is generated from templates.

That’s your moat: predictable quality.

---
