import { ApiProperty } from '@nestjs/swagger';
import { AbsenceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

export class AttendanceEntryDto {
  @ApiProperty({ example: 'student-cuid' })
  @IsString()
  studentId: string;

  @ApiProperty({ enum: AbsenceStatus, example: AbsenceStatus.PRESENT })
  @IsEnum(AbsenceStatus)
  status: AbsenceStatus;
}

export class MarkAttendanceDto {
  @ApiProperty({ type: [AttendanceEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  attendances: AttendanceEntryDto[];
}