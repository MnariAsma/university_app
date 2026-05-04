import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  targetProgramId?: string;

  @IsString()
  @IsOptional()
  targetLevelId?: string;
}
