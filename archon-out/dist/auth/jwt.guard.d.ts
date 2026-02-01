import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class JwtAuthGuard implements CanActivate {
    private jwks?;
    private cfg;
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
    private verify;
}
