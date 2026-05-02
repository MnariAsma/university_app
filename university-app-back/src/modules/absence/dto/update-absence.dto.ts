import { ApiProperty } from '@nestjs/swagger';
import { AbsenceStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateAbsenceDto {
  @ApiProperty({ enum: AbsenceStatus })
  @IsEnum(AbsenceStatus)
  status: AbsenceStatus;
}