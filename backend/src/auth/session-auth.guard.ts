import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { SESSION_COOKIE_NAME } from './session.constants';

export interface AuthenticatedRequest extends Request {
  sessionId: string;
}

/**
 * Protects routes by validating the vf_session cookie against the backend session store.
 * Throws UnauthorizedException (401) via AuthService.resolveSession for a missing, unknown,
 * revoked, or expired session — Nest turns that into the HTTP response automatically.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
    const resolved = await this.authService.resolveSession(sessionId);
    req.sessionId = resolved.sessionId;
    return true;
  }
}
