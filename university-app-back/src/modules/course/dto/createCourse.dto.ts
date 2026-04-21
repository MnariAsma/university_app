import { CourseType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createCourseDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  subjectId: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;

  @ApiProperty({ example: 'Mathematics' })
  @IsOptional()
  content?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  file?: any;
}
