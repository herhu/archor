import { DiagramIR } from "../schema/ir.js";

// Basic Archon DesignSpec v1 Types (simplified)
interface DesignSpec {
  name: string;
  version: string;
  domains: Domain[];
  modules?: any;
}

interface Domain {
  name: string;
  entities: Entity[];
  services: Service[];
}

interface Entity {
  name: string;
  primaryKey: string;
  fields: Field[];
}

interface Field {
  name: string;
  type: string;
  primary?: boolean;
  nullable?: boolean;
}

interface Service {
  name: string;
  entity: string;
  crud: string[];
  operations?: Operation[];
}

interface Operation {
  name: string;
  method: string;
  path: string;
  authz?: any;
}

export function transformIRToDesignSpec(ir: DiagramIR): DesignSpec {
  const spec: DesignSpec = {
    name: "Generated App",
    version: "1.0.0",
    domains: []
  };

  // Process ALL diagrams for entities first
  // Don't filter by kind because mixed diagrams (created by simple parser) might contain classes but be labeled 'sequence'
  
  const defaultDomain: Domain = {
      name: "AppDomain",
      entities: [],
      services: []
  };

  for (const diagram of ir.diagrams) {
      for (const element of diagram.elements) {
          if (element.type === 'classifier' && element.kind === 'class') {
              const entity = transformClassToEntity(element as any);
              defaultDomain.entities.push(entity);
              
              // Automatically create a CRUD service for the entity
              // as per instructions: "default CRUD service per entity"
              defaultDomain.services.push({
                  name: `${entity.name}Service`,
                  entity: entity.name,
                  crud: ["create", "findAll", "findOne", "update", "delete"]
              });
          }
          // Map Components to Services
          else if (element.type === 'component') {
              const serviceName = element.name.replace(/\s+/g, '');
              // Avoid duplicates
              if (!defaultDomain.services.find(s => s.name === serviceName)) {
                  defaultDomain.services.push({
                      name: serviceName,
                      entity: "None", // Components might not have a primary entity
                      crud: [],
                      operations: [] // Will be enriched by sequence diagrams if applicable
                  });
              }
          }
      }
  }

  if (defaultDomain.entities.length > 0) {
      spec.domains.push(defaultDomain);
  }

  // --- Process Sequence Diagrams to enrich Services ---
  // Iterate ALL diagrams again for relationships
  for (const seq of ir.diagrams) {
      for (const r of seq.relationships) {
          const rel: any = r; // Cast to access 'kind' which is property of Message
          if (rel.type === 'message' && (rel.kind === 'sync' || rel.kind === 'async')) {
              // Target is the service
              // Find the service in domains
              // We need to resolve 'to' ID to a name. 
              // In Sequence, 'to' is a participant ID. We need participant's name or mapped classifier.
              
              const targetParticipant = seq.elements.find(e => e.id === rel.to);
              if (!targetParticipant) continue;
              
              const targetName = targetParticipant.name.replace(/\s+/g, ''); // Simple normalization
              
              // Find service with this name (assuming Service suffix or exact match)
              let service = findService(spec, targetName);
              if (!service) service = findService(spec, targetName + "Service");
              
              if (service) {
                  const method = rel.kind === 'sync' ? 'POST' : 'POST'; // Default to POST for actions
                  const opName = rel.label ? rel.label.split('(')[0].replace(/\s+/g, '') : "unnamedOperation";
                  
                  if (!service.operations) service.operations = [];
                  
                  // Check if exists
                  if (!service.operations.find(o => o.name === opName)) {
                      service.operations.push({
                          name: opName,
                          method,
                          path: `/${opName.toLowerCase()}`, // naive path generation
                          authz: { required: true }
                      });
                  }
              }
          }
      }
  }

  return spec;
}

function findService(spec: DesignSpec, name: string): Service | undefined {
    for (const d of spec.domains) {
        const s = d.services.find(svc => svc.name === name);
        if (s) return s;
    }
    return undefined;
}

function transformClassToEntity(clazz: any): Entity {
    // Determine primary key
    // 1. Look for field with [pk] tag (not yet implemented in parser fully but let's assume existence)
    // 2. Look for field named 'id'
    
    let primaryKey = "id";
    const fields: Field[] = [];

    // Transform attributes
    if (clazz.attributes) {
        for (const attr of clazz.attributes) {
            const field: Field = {
                name: attr.name,
                type: mapType(attr.typeRef?.name)
            };
            
            if (attr.name === 'id' || attr.name === 'ID' || attr.name === 'Id') {
                field.primary = true;
                primaryKey = attr.name;
            }
            // TODO: check for [pk] tag in tags if available

            fields.push(field);
        }
    }

    // Ensure PK exists if not found
    if (!fields.find(f => f.name === primaryKey)) {
        fields.unshift({
            name: "id",
            type: "uuid",
            primary: true
        });
        primaryKey = "id";
    }

    return {
        name: clazz.name,
        primaryKey,
        fields
    };
}

function mapType(type: string): string {
    if (!type) return "string";
    const lower = type.toLowerCase();
    if (lower === 'uuid') return 'uuid';
    if (lower === 'string' || lower === 'text') return 'string';
    if (lower === 'int' || lower === 'integer' || lower === 'number') return 'int'; // Archon uses 'int' or 'number'? sample-spec says 'int'
    if (lower === 'boolean' || lower === 'bool') return 'boolean';
    if (lower === 'date' || lower === 'datetime') return 'datetime'; // Archon might expect 'date'
    return type; // fallback
}
