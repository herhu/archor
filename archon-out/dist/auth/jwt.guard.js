"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jose_1 = require("jose");
const jwt_config_1 = require("./jwt.config");
function extractBearerToken(req) {
    const auth = req.headers?.authorization || req.headers?.Authorization || '';
    const s = String(auth);
    if (!s.startsWith('Bearer '))
        return null;
    return s.slice('Bearer '.length).trim();
}
function normalizeRoles(payload) {
    const candidates = [
        payload?.roles,
        payload?.role,
        payload?.['https://example.com/roles'],
        payload?.['permissions']
    ];
    for (const c of candidates) {
        if (Array.isArray(c))
            return c.map(String);
        if (typeof c === 'string' && c.length)
            return [c];
    }
    return [];
}
function extractScopes(payload) {
    const candidates = [
        payload?.scope,
        payload?.scp,
        payload?.permissions,
        payload?.['https://example.com/scopes'],
        payload?.['https://example.com/permissions']
    ];
    const scopes = new Set();
    for (const c of candidates) {
        if (!c)
            continue;
        if (Array.isArray(c)) {
            c.forEach(s => scopes.add(String(s)));
        }
        else if (typeof c === 'string') {
            c.split(/[ ,]+/).forEach(s => s && scopes.add(s));
        }
    }
    return Array.from(scopes);
}
let JwtAuthGuard = class JwtAuthGuard {
    constructor() {
        this.cfg = (0, jwt_config_1.loadJwtConfig)();
        if (this.cfg.mode === 'jwks' && this.cfg.jwksUri) {
            this.jwks = (0, jose_1.createRemoteJWKSet)(new URL(this.cfg.jwksUri));
        }
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const token = extractBearerToken(req);
        if (!token)
            throw new common_1.UnauthorizedException('Missing Bearer token');
        try {
            const { payload } = await this.verify(token);
            const user = {
                sub: typeof payload.sub === 'string' ? payload.sub : undefined,
                email: typeof payload.email === 'string' ? payload.email : undefined,
                roles: normalizeRoles(payload),
                scopes: extractScopes(payload),
                raw: payload
            };
            req.user = user;
            return true;
        }
        catch (e) {
            console.error(e);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async verify(token) {
        if (this.cfg.mode === 'jwks') {
            if (!this.jwks)
                throw new Error('JWKS not configured');
            return (0, jose_1.jwtVerify)(token, this.jwks, {
                issuer: this.cfg.issuer,
                audience: this.cfg.audience
            });
        }
        const secret = new TextEncoder().encode(this.cfg.secret || '');
        return (0, jose_1.jwtVerify)(token, secret, {
            issuer: this.cfg.issuer,
            audience: this.cfg.audience
        });
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtAuthGuard);
//# sourceMappingURL=jwt.guard.js.map