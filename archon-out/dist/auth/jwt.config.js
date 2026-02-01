"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJwtConfig = loadJwtConfig;
function loadJwtConfig() {
    const issuer = process.env.JWT_ISSUER ?? '{{jwtIssuer}}';
    const audience = process.env.JWT_AUDIENCE ?? '{{jwtAudience}}';
    const jwksUri = process.env.JWT_JWKS_URI;
    const secret = process.env.JWT_SECRET;
    if (jwksUri) {
        return { issuer, audience, mode: 'jwks', jwksUri };
    }
    if (secret) {
        return { issuer, audience, mode: 'secret', secret };
    }
    throw new Error('Invalid Auth Config: Set either JWT_JWKS_URI (for remote) or JWT_SECRET (for local/HS256) in .env');
}
//# sourceMappingURL=jwt.config.js.map