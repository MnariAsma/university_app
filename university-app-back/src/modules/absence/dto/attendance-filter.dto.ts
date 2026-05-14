import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AttendanceFilterDto {
  @ApiPropertyOptional({ example: '2026-04-01', description: 'Filter by date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'group-cuid' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ example: 'subject-cuid' })
  @IsOptional()
  @IsString()
  subjectId?: string;
}