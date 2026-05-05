import { Controller, Get, Req, Post, Body, Query } from '@nestjs/common';
import { GradeService } from './grade.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';

type AppRole = Parameters<typeof Roles>[number];
import { CreateGradesDto } from './dto/create-grades.dto';

@ApiTags('grades')
@ApiBearerAuth()
@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Roles('TEACHER' as AppRole, 'ADMIN' as AppRole)
  @Get('subjects')
  async mySubjects(@Req() req) {
    return this.gradeService.findTeacherSubjects(req.user.id);
  }

  @Roles('TEACHER' as AppRole, 'ADMIN' as AppRole)
  @Get('placements')
  async placements(@Req() req, @Query('subjectId') subjectId?: string) {
    if (!subjectId) {
      throw new Error('subjectId is required');
    }
    return this.gradeService.findProgramLevelCombos(req.user.id, subjectId);
  }

  @Roles('TEACHER' as AppRole, 'ADMIN' as AppRole)
  @Get('programs')
  async programs(@Req() req, @Query('subjectId') subjectId?: string) {
    return this.gradeService.findPrograms(req.user.id, subjectId);
  }

  @Roles('TEACHER' as AppRole, 'ADMIN' as AppRole)
  @Get('levels')
  async levels(
    @Req() req,
    @Query('programId') programId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.gradeService.findLevels(programId, req.user.id, subjectId);
  }

  @Roles('TEACHER' as AppRole, 'ADMIN' as AppRole)
  @Get('students')
  async students(
    @Query('programId') programId: string,
    @Query('levelId') levelId: string,
    @Query('subjectId') subjectId?: string,
    @Query('evaluationType') evaluationType?: string,
    @Query('semester') semester?: string,
  ) {
    return this.gradeService.findStudents(
      programId, 
      levelId, 
      subjectId, 
      evaluationType, 
      semester ? Number(semester) : undefined
    );
  }

  @Roles('TEACHER' as AppRole, 'ADMIN' as AppRole)
  @Post()
  async save(@Body() dto: CreateGradesDto, @Req() req) {
    return this.gradeService.upsertGrades(dto, req.user.id);
  }

  @Roles(Role.STUDENT)
  @Get('my-grades')
  async myGrades(@Req() req) {
    return this.gradeService.findStudentGrades(req.user.id);
  }
}



