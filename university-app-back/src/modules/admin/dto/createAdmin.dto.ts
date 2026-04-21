import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from 'src/modules/users/dto/createUser.dto';

export class CreateAdminDto extends CreateUserDto { }