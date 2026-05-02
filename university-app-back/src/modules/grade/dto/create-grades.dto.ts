import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GradeItemDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateGradesDto {
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsString()
  @IsNotEmpty()
  evaluationType: string; // e.g., 'EXAM' or 'TP'

  @IsNumber()
  semester: number;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @ValidateNested({ each: true })
  @Type(() => GradeItemDto)
  @ArrayNotEmpty()
  grades: GradeItemDto[];
}
