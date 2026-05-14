import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProgramDto {
  @ApiProperty({ example: 'Computer Engineering' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CE-2024' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'A comprehensive computer engineering program' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'License' })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiProperty({ example: 'cuid-department-id' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;
}
