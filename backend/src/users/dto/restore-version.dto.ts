import { IsOptional, IsString, MinLength } from 'class-validator';

export class RestoreVersionDto {
  @IsString()
  @MinLength(1)
  versionId: string;
}

export class CreateVersionDto {
  @IsOptional()
  @IsString()
  label?: string;
}

export class CreateCoverLetterVersionDto {
  @IsOptional()
  @IsString()
  label?: string;
}
