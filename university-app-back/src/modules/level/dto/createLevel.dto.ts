import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({ example: 'Licence 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ApiProperty({ example: 'program-uuid' })
  @IsString()
  @IsNotEmpty()
  programId: string;

}
