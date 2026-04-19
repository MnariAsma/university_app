import { PartialType } from '@nestjs/swagger';
import { CreateSubjectDto } from './createSubject.dto';

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
