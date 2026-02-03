export type CrudOp = "create" | "findAll" | "findOne" | "update" | "delete";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type FieldType = "int" | "string" | "boolean" | "json";

export type Authz =
    | { required: false } // explicit public
    | { scopesAll: string[] }; // protected

export type JwtConfig = {
    issuer: string;
    audience: string;
    jwksUri: string;
};

export type CrossCutting = {
    auth: {
        jwt: JwtConfig;
    };
};

export type FieldSpec = {
    name: string;
    type: FieldType;
    nullable?: boolean;
    primary?: boolean;
};

export type EntitySpec = {
    name: string;
    primaryKey: string;
    fields: FieldSpec[];
};

export type OperationSpec = {
    name: string;
    method: HttpMethod;
    path: string; // must start with "/"
    authz: Authz;
};

export type ServiceSpec = {
    name: string;
    route: string; // no leading slash recommended (your sample uses no slash)
    entity: string; // must match an entity.name within same domain
    crud: CrudOp[];
    operations?: OperationSpec[];
};

export type DomainSpec = {
    name: string;
    key: string; // e.g. "patient"
    entities: EntitySpec[];
    services: ServiceSpec[];
};

export type DesignSpecV1 = {
    name: string;
    crossCutting: CrossCutting;
    domains: DomainSpec[];
};
