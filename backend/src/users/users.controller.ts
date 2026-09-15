import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, SessionAuthGuard } from '../auth/session-auth.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { CreateVersionDto, RestoreVersionDto } from './dto/restore-version.dto';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(SessionAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.sessionId);
  }

  @Post('profile')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  updateProfile(@Req() req: AuthenticatedRequest, @Body() body: UpsertProfileDto) {
    return this.usersService.upsertProfile(req.sessionId, body);
  }

  @Delete('profile')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.deleteProfile(req.sessionId);
  }

  @Get('profile/versions')
  @HttpCode(HttpStatus.OK)
  listVersions(@Req() req: AuthenticatedRequest) {
    return this.usersService.listVersions(req.sessionId);
  }

  @Post('profile/versions')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.CREATED)
  createVersion(@Req() req: AuthenticatedRequest, @Body() body: CreateVersionDto) {
    return this.usersService.createVersion(req.sessionId, body?.label);
  }

  @Post('profile/versions/restore')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  restoreVersion(@Req() req: AuthenticatedRequest, @Body() body: RestoreVersionDto) {
    return this.usersService.restoreVersion(req.sessionId, body.versionId);
  }
}
