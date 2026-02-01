export type JwtVerifyMode = 'jwks' | 'secret';
export type JwtConfig = {
    issuer: string;
    audience: string;
    mode: JwtVerifyMode;
    jwksUri?: string;
    secret?: string;
};
export declare function loadJwtConfig(): JwtConfig;
