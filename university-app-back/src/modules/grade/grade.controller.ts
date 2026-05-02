import { Controller, Get, Req, Post, Body, Query } from '@nestjs/common';
import { GradeService } from './grade.service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateGradesDto } from './create-grades.dto';

@ApiTags('grades')
@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('subjects')
  async mySubjects(@Req() req) {
    return this.gradeService.findTeacherSubjects(req.user.id);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('placements')
  async placements(@Req() req, @Query('subjectId') subjectId?: string) {
    if (!subjectId) {
      throw new Error('subjectId is required');
    }
    return this.gradeService.findProgramLevelCombos(req.user.id, subjectId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('programs')
  async programs(@Req() req, @Query('subjectId') subjectId?: string) {
    return this.gradeService.findPrograms(req.user.id, subjectId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('levels')
  async levels(
    @Req() req,
    @Query('programId') programId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.gradeService.findLevels(programId, req.user.id, subjectId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('students')
  async students(
    @Query('programId') programId: string,
    @Query('levelId') levelId: string,
  ) {
    return this.gradeService.findStudents(programId, levelId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Post()
  async save(@Body() dto: CreateGradesDto, @Req() req) {
    return this.gradeService.upsertGrades(dto, req.user.id);
  }
}
