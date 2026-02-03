const { SignJWT } = require('jose');
const crypto = require('crypto');

async function generateToken() {
    const secretKey = process.env.JWT_SECRET || 'super-secret-dev-key';
    const secret = new TextEncoder().encode(secretKey);

    // Defaults matching jwt.config.ts placeholders if env not set
    const issuer = process.env.JWT_ISSUER || '{{jwtIssuer}}';
    const audience = process.env.JWT_AUDIENCE || '{{jwtAudience}}';

    const alg = 'HS256';

    const jwt = await new SignJWT({
        'sub': 'user-123',
        'email': 'test@example.com',
        'roles': ['admin', 'user'],
        'scope': 'patient:read patient:write' // Scopes for our smoke test
    })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer(issuer)
        .setAudience(audience)
        .setExpirationTime('2h')
        .sign(secret);

    console.log(jwt);
}

generateToken().catch(console.error);
