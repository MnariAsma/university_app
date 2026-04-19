import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { TeacherService } from './teachers.service';
import { CreateTeacherDto } from './dto/createTeacher.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.remove(id);
  }
}
