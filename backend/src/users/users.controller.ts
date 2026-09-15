import { Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateCoverLetterVersionDto, CreateVersionDto, RestoreVersionDto } from './dto/restore-version.dto';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@Headers('authorization') authorization?: string) {
    return this.usersService.getProfile(authorization);
  }

  @Post('profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpsertProfileDto,
  ) {
    return this.usersService.upsertProfile(authorization, body);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProfile(@Headers('authorization') authorization?: string) {
    return this.usersService.deleteProfile(authorization);
  }

  @Get('profile/versions')
  @HttpCode(HttpStatus.OK)
  listVersions(@Headers('authorization') authorization?: string) {
    return this.usersService.listVersions(authorization);
  }

  @Post('profile/versions')
  @HttpCode(HttpStatus.CREATED)
  createVersion(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateVersionDto,
  ) {
    return this.usersService.createVersion(authorization, body?.label);
  }

  @Post('profile/versions/restore')
  @HttpCode(HttpStatus.OK)
  restoreVersion(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: RestoreVersionDto,
  ) {
    return this.usersService.restoreVersion(authorization, body.versionId);
  }

  @Get('cover-letters')
  @HttpCode(HttpStatus.OK)
  listCoverLetters(@Headers('authorization') authorization?: string) {
    return this.usersService.listCoverLetterVersions(authorization);
  }

  @Post('cover-letters')
  @HttpCode(HttpStatus.CREATED)
  createCoverLetter(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateCoverLetterVersionDto,
  ) {
    return this.usersService.createCoverLetterVersion(authorization, body?.label);
  }
}
