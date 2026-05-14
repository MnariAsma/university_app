import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MATH101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Introduction to calculus and algebra' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @IsOptional()
  coefficient?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsInt()
  @IsOptional()
  hours?: number;

  @ApiProperty({ example: 'cuid-program-id' })
  @IsString()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  semester: number;
}
