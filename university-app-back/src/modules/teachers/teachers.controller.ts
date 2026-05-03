import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { TeacherService } from './teachers.service';
import { CreateTeacherDto } from './dto/createTeacher.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('teachers')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeacherService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.remove(id);
  }
}
