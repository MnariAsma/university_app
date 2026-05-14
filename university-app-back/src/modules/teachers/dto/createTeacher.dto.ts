import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from 'src/modules/users/dto/createUser.dto';

export class CreateTeacherDto extends CreateUserDto{

  @ApiProperty({
    description: 'Department ID of the teacher',
    example: '1',
  })
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: 'Specialty of the teacher',
    example: 'Computer Science',
  })
  @IsOptional()
  specialty?: string;

  @ApiProperty({
    description: 'Grade of the teacher',
    example: 'Professor',
  })
  @IsOptional()
  grade?: string;
}