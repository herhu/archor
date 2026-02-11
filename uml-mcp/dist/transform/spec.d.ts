import { DiagramIR } from "../schema/ir.js";
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
export declare function transformIRToDesignSpec(ir: DiagramIR): DesignSpec;
export {};
