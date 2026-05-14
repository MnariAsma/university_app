import { PartialType } from '@nestjs/swagger';
import { CreateGroupDto } from './createGroup.dto';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}
