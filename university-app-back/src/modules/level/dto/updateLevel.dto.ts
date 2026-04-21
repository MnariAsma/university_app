import { PartialType } from '@nestjs/swagger';
import { CreateLevelDto } from './createLevel.dto';

export class UpdateLevelDto extends PartialType(CreateLevelDto) {}
