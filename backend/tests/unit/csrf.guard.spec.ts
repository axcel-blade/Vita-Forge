import { ForbiddenException } from '@nestjs/common';
import { CsrfGuard } from '../../src/auth/csrf.guard';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../../src/auth/session.constants';

function fakeContext(method: string, cookies: Record<string, string>, headers: Record<string, string>) {
  const req = { method, cookies, headers };
  return { switchToHttp: () => ({ getRequest: () => req }) } as never;
}

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();

  it('allows safe methods through without a CSRF token', () => {
    expect(guard.canActivate(fakeContext('GET', {}, {}))).toBe(true);
  });

  it('allows a mutating request when the header matches the cookie', () => {
    const ctx = fakeContext(
      'POST',
      { [CSRF_COOKIE_NAME]: 'token-123' },
      { [CSRF_HEADER_NAME]: 'token-123' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects a mutating request with a missing CSRF cookie', () => {
    const ctx = fakeContext('POST', {}, { [CSRF_HEADER_NAME]: 'token-123' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('rejects a mutating request with a missing CSRF header', () => {
    const ctx = fakeContext('POST', { [CSRF_COOKIE_NAME]: 'token-123' }, {});
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('rejects a mutating request where the header does not match the cookie', () => {
    const ctx = fakeContext(
      'DELETE',
      { [CSRF_COOKIE_NAME]: 'token-123' },
      { [CSRF_HEADER_NAME]: 'attacker-guess' },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
