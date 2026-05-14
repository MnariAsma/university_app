import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class TimetableQueryDto {
  @ApiPropertyOptional({
    example: '2026-05-01',
    description: 'Start of week date (YYYY-MM-DD). Defaults to current week if not provided.',
  })
  @IsOptional()
  @IsDateString()
  weekStart?: string;
}