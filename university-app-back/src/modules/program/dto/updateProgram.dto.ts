import { PartialType } from '@nestjs/swagger';
import { CreateProgramDto } from './createProgram.dto';

export class UpdateProgramDto extends PartialType(CreateProgramDto) {}
