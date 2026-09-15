import 'reflect-metadata';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ProfileDocumentDto } from './profile-document.dto';

export class UpsertProfileDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileDocumentDto)
  resumes?: ProfileDocumentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileDocumentDto)
  coverLetters?: ProfileDocumentDto[];
}
