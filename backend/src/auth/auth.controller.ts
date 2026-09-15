import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest, SessionAuthGuard } from './session-auth.guard';
import { CsrfGuard } from './csrf.guard';
import { CSRF_COOKIE_NAME, SESSION_COOKIE_NAME, SESSION_TTL_MS } from './session.constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto, this.sessionMeta(req));
    this.applySessionCookies(res, result.sessionId, result.csrfToken);
    return { message: result.message, userId: result.userId };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto, this.sessionMeta(req));
    this.applySessionCookies(res, result.sessionId, result.csrfToken);
    return { message: result.message, userId: result.userId };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.getMe(req.sessionId);
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.sessionId);
    this.clearSessionCookies(res);
  }

  @Get('sessions')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  listSessions(@Req() req: AuthenticatedRequest) {
    return this.authService.listSessions(req.sessionId);
  }

  @Delete('sessions/:id')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeSession(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.authService.revokeSession(req.sessionId, id);
  }

  @Patch('account')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  @HttpCode(HttpStatus.OK)
  updateAccount(@Req() req: AuthenticatedRequest, @Body() body: UpdateAccountDto) {
    return this.authService.updateAccount(req.sessionId, body);
  }

  @Post('change-password')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(@Req() req: AuthenticatedRequest, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(req.sessionId, body);
  }

  private sessionMeta(req: Request) {
    return { userAgent: req.headers['user-agent'] ?? null, ip: req.ip ?? null };
  }

  private applySessionCookies(res: Response, sessionId: string, csrfToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    const base: CookieOptions = {
      path: '/',
      maxAge: SESSION_TTL_MS,
      secure: isProd,
      sameSite: 'lax',
    };
    // Session id: HttpOnly so page JS (and XSS) can never read it.
    res.cookie(SESSION_COOKIE_NAME, sessionId, { ...base, httpOnly: true });
    // CSRF token: deliberately readable so the frontend can echo it back as a header.
    res.cookie(CSRF_COOKIE_NAME, csrfToken, { ...base, httpOnly: false });
  }

  private clearSessionCookies(res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
  }
}
