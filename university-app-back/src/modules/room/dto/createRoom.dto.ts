import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Room 101' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 40 })
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ example: 'Building A' })
  @IsString()
  @IsOptional()
  building?: string;

}
