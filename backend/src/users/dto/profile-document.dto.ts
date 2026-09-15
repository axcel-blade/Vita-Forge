import { IsISO8601, IsObject, IsString } from 'class-validator';

export class ProfileDocumentDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsObject()
  data!: Record<string, unknown>;

  @IsISO8601()
  createdAt!: string;

  @IsISO8601()
  updatedAt!: string;
}
