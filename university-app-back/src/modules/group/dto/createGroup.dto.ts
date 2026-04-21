import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Group 4' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'GRP-4' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'level-uuid' })
  @IsString()
  @IsNotEmpty()
  levelId: string;

}
