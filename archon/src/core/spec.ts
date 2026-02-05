export interface DesignSpec {
    version: string;
    name: string;
    platform?: PlatformConfig;
    modules?: ModuleConfig[];
    domains: Domain[];
    crossCutting?: {
        auth?: {
            jwt?: {
                issuer: string;
                audience: string;
                jwksUri?: string;
                defaultScopes?: string; // Space separated
            };
        };
    };
}

export interface PlatformConfig {
    cors?: boolean;
    cookieParser?: boolean;
    securityHeaders?: boolean;
    swagger?: boolean;
    throttling?: boolean;
    rateLimitTtl?: number;
    rateLimitMax?: number;
    maxBodySize?: string;
}

export interface ModuleConfig {
    type: string; // 'redis', 'bullmq', etc.
    name: string;
    config?: Record<string, any>;
}

export interface Domain {
    name: string;
    key: string; // e.g., 'patient-notification'
    entities: Entity[];
    services: Service[];
}

export interface Entity {
    name: string; // e.g. 'PatientNotification'
    primaryKey?: string;
    fields: Field[];
}

export interface Field {
    name: string;
    type: string; // 'string', 'boolean', 'uuid', 'int', 'float', 'timestamp', 'json'
    primary?: boolean;
    nullable?: boolean;
}

export interface Service {
    name: string; // e.g. 'PatientNotificationService'
    route: string; // e.g. 'notifications'
    entity?: string; // e.g. 'PatientNotification' (explicit reference)
    crud?: ('create' | 'findAll' | 'findOne' | 'update' | 'delete')[];
    operations?: Operation[];
}

export interface Operation {
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string; // e.g. '/settings'
    authz?: {
        required?: boolean;
        scopesAll?: string[];
    };
    request?: {
        schemaRef?: string;
    };
}
