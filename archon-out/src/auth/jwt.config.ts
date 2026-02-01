export type JwtVerifyMode = 'jwks' | 'secret';

export type JwtConfig = {
issuer: string;
audience: string;
mode: JwtVerifyMode;
jwksUri?: string;
secret?: string;
};

export function loadJwtConfig(): JwtConfig {
const issuer = process.env.JWT_ISSUER || '';
const audience = process.env.JWT_AUDIENCE || '';

const jwksUri = process.env.JWT_JWKS_URI || '';
const secret = process.env.JWT_SECRET || '';

if (!issuer || !audience) {
// throw new Error('JWT_ISSUER and JWT_AUDIENCE must be set');
// WARN: Relaxed for initial scaffold to allow run without strict env
console.warn('JWT_ISSUER and JWT_AUDIENCE must be set in .env');
}

if (jwksUri) {
return { issuer, audience, mode: 'jwks', jwksUri };
}

if (secret) {
return { issuer, audience, mode: 'secret', secret };
}

// Default to nothing or error
return { issuer, audience, mode: 'jwks', jwksUri: '' };
}