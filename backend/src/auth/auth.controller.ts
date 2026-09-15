import { Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    return this.authService.register(registerDto, this.sessionMeta(req));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, this.sessionMeta(req));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@Headers('authorization') authorization?: string) {
    return this.authService.getMe(authorization);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Headers('authorization') authorization?: string) {
    return this.authService.logout(authorization);
  }

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  listSessions(@Headers('authorization') authorization?: string) {
    return this.authService.listSessions(authorization);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeSession(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ) {
    return this.authService.revokeSession(authorization, id);
  }

  private sessionMeta(req: Request) {
    return { userAgent: req.headers['user-agent'] ?? null, ip: req.ip ?? null };
  }
}
