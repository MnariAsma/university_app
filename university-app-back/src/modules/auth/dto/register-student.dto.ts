import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterStudentDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty()
    @IsString()
    departmentId: string;

    @ApiProperty()
    @IsString()
    programId: string;

    @ApiProperty()
    @IsString()
    groupId: string;

    @ApiProperty()
    @IsString()
    academicYearId: string;
}