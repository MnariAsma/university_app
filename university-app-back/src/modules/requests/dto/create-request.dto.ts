import { ApiProperty } from '@nestjs/swagger';
import { RequestCategory, RequestType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({ enum: RequestCategory })
  @IsEnum(RequestCategory)
  @IsNotEmpty()
  category: RequestCategory;

  @ApiProperty({ enum: RequestType })
  @IsEnum(RequestType)
  @IsNotEmpty()
  type: RequestType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  academicYearId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
