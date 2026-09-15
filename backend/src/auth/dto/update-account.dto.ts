import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly name?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;
}
