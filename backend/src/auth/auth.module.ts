import { Module } from '@nestjs/common';
import { PrismaModule } from '../repositories/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { SessionAuthGuard } from './session-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, SessionAuthGuard, CsrfGuard],
  exports: [AuthService, SessionAuthGuard, CsrfGuard],
})
export class AuthModule {}
