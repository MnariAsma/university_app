import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { TeacherService } from './teachers.service';
import { CreateTeacherDto } from './dto/createTeacher.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';

type AppRole = Parameters<typeof Roles>[number];

@ApiTags('teachers')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeacherService) {}

  @Roles('ADMIN' as AppRole)
  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Roles('ADMIN' as AppRole)
  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Roles('ADMIN' as AppRole)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Roles('ADMIN' as AppRole)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.remove(id);
  }
}



