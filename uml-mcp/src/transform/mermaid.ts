
import { DesignSpec, Domain, Entity, Service, Operation } from './spec.js';

export function generateModelDiagram(spec: DesignSpec): string {
    let lines: string[] = ['classDiagram'];
    
    // Add domains/namespaces
    for (const domain of spec.domains) {
        for (const entity of domain.entities) {
            lines.push(`    class ${entity.name}`);
            
            // Fields - Collect potential FKs
            for (const field of entity.fields) {
                const type = field.type || 'string';
                // Mark PK
                if (field.primary) {
                    lines.push(`    ${entity.name} : +${type} ${field.name} PK`);
                } else if (field.name.endsWith('Id') && field.name.length > 2) {
                    // Potential Foreign Key notation
                    lines.push(`    ${entity.name} : +${type} ${field.name} FK`);
                } else {
                    lines.push(`    ${entity.name} : +${type} ${field.name}`);
                }
            }
        }
        
        // Relationships
        for (const entity of domain.entities) {
            for (const field of entity.fields) {
                 const targetType = field.type;
                 
                 // 1. Direct Type Reference (e.g. author: User)
                 if (targetType && targetType !== 'string' && targetType !== 'int' && targetType !== 'boolean' && targetType !== 'uuid') {
                     const target = findEntity(spec, targetType);
                     if (target) {
                         lines.push(`    ${entity.name} --> ${target.name} : ${field.name}`);
                         continue;
                     }
                 }

                 // 2. ID Reference (e.g. userId: uuid -> User)
                 if (field.name.endsWith('Id') && field.name.length > 2) {
                     const potentialEntityName = field.name.slice(0, -2); // Remove 'Id'
                     // Capitalize first letter to match Entity Case usually
                     const targetName = potentialEntityName.charAt(0).toUpperCase() + potentialEntityName.slice(1);
                     
                     // Find if this entity exists in ANY domain
                     const target = findEntity(spec, targetName);
                     if (target) {
                         lines.push(`    ${entity.name} --> ${target.name} : ${field.name}`);
                     }
                 }
            }
        }
    }

    return lines.join('\n');
}

export function generateSequenceDiagram(spec: DesignSpec): string {
    let lines: string[] = ['sequenceDiagram'];
    lines.push('    autonumber');
    lines.push('    actor Client');
    
    // Iterate services and show typical CRUD flow
    for (const domain of spec.domains) {
        for (const service of domain.services) {
            lines.push(`    participant ${service.name}`);
            const entityName = service.entity;
            if (entityName && entityName !== 'None') {
                lines.push(`    participant ${entityName}`);
            }
            
            // Operations
            if (service.operations) {
                for (const op of service.operations) {
                    lines.push(`    Client->>${service.name}: ${op.method} ${op.path}`);
                    if (entityName && entityName !== 'None') {
                        lines.push(`    ${service.name}->>${entityName}: query`);
                        lines.push(`    ${entityName}-->>${service.name}: result`);
                    }
                    lines.push(`    ${service.name}-->>Client: 200 OK`);
                }
            }
             // Default CRUD
            if (service.crud && service.crud.includes('create')) {
                lines.push(`    Note over Client, ${service.name}: Standard CRUD: Create`);
                lines.push(`    Client->>${service.name}: POST /${service.route || service.name.toLowerCase()}`);
                 if (entityName && entityName !== 'None') {
                    lines.push(`    ${service.name}->>${entityName}: save()`);
                }
                lines.push(`    ${service.name}-->>Client: 201 Created`);
            }
        }
    }
    
    return lines.join('\n');
}

export function generateUseCaseDiagram(spec: DesignSpec): string {
    const lines = ['graph LR'];
    
    // Global styling definitions
    lines.push('    classDef actorStyle fill:#f9f,stroke:#333,stroke-width:2px;');
    lines.push('    classDef usecaseStyle fill:#fff,stroke:#333,stroke-width:2px,color:#000,rx:10,ry:10;');

    const links: string[] = [];
    const actors = new Set<string>(); // IDs

    for (const domain of spec.domains) {
        // Domain Subgraph
        const domainId = `Domain_${domain.name.replace(/[^a-zA-Z0-9]/g, '')}`;
        lines.push(`    subgraph ${domainId} ["${domain.name}"]`);
        lines.push(`        direction TB`);

        for (const service of domain.services) {
             const serviceId = `Service_${service.name.replace(/[^a-zA-Z0-9]/g, '')}`;
             lines.push(`        subgraph ${serviceId} ["${service.name}"]`);
             
             if (service.operations) {
                 for (const op of service.operations) {
                     const label = op.name;
                     // Sanitize ID
                     const ucId = `${service.name}_${op.name}`.replace(/[^a-zA-Z0-9]/g, '');
                     
                     // Render Use Case Node
                     lines.push(`            ${ucId}(["${label}"])`);
                     lines.push(`            class ${ucId} usecaseStyle`);
                     
                     // Actors Logic
                     let opActors: string[] = [];
                     if (op.authz?.scopesAll) {
                         opActors = op.authz.scopesAll.map((s: string) => s.split(':')[0]); 
                     } else if (op.authz?.required === false) {
                         opActors = ['Public'];
                     } else {
                         opActors = ['User'];
                     }
                     
                     for (const actor of opActors) {
                         const actorClean = actor.replace(/[^a-zA-Z0-9]/g, '');
                         const actorId = `Actor_${actorClean}`;
                         const actorLabel = actor.charAt(0).toUpperCase() + actor.slice(1);
                         
                         // We track actors to define them globally later if needed, 
                         // or we can just assume they exist. To style them, we need definitions.
                         if (!actors.has(actorId)) {
                             actors.add(actorId + `((${actorLabel}))`); // Store full definition
                         }
                         
                         // Link: Actor -> UseCase
                         links.push(`    ${actorId.split('(')[0]} --> ${ucId}`);
                     }
                 }
             }
             lines.push(`        end`); // End Service
        }
        lines.push(`    end`); // End Domain
    }

    // Output Actors (outside subgraphs to allow shared actors across domains)
    // Actually, Mermaid handles nodes defined anywhere. 
    // to keep layout clean, maybe we print them at the top or bottom?
    // Let's print them here.
    for (const actorDef of actors) {
        const actorId = actorDef.split('(')[0]; // Extract ID part "Actor_User" from "Actor_User((User))"
        lines.push(`    ${actorDef}`);
        lines.push(`    class ${actorId} actorStyle`);
    }

    // Output Links
    for (const link of links) {
        lines.push(link);
    }

    return lines.join('\n');
}

export function generateComponentDiagram(spec: DesignSpec): string {
    let lines: string[] = ['graph TD'];
    
    for (const domain of spec.domains) {
        lines.push(`    subgraph ${domain.name}`);
        lines.push(`        direction TB`);
        
        for (const service of domain.services) {
            const svcId = service.name.replace(/[^a-zA-Z0-9]/g, '');
            lines.push(`        ${svcId}[${service.name}]`);
            if (service.entity && service.entity !== 'None') {
                 const entId = service.entity.replace(/[^a-zA-Z0-9]/g, '');
                 lines.push(`        ${entId}[(${service.entity})]`);
                 lines.push(`        ${svcId} --> ${entId}`);
            }
        }
        
        lines.push(`    end`);
    }

    return lines.join('\n');
}

function findEntity(spec: DesignSpec, name: string): Entity | undefined {
    for (const d of spec.domains) {
        const found = d.entities.find(e => e.name === name);
        if (found) return found;
    }
    return undefined;
}
