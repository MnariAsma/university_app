import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AbsenceService } from './absence.service';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';

type AppRole = Parameters<typeof Roles>[number];

@ApiTags('absences')
@ApiBearerAuth()
@Controller('absences')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  // ══════════════════════════════════════════════════════════════════
  // TEACHER ROUTES
  // ══════════════════════════════════════════════════════════════════

  @Get('teacher/current-session')
  @Roles('TEACHER' as AppRole)
  @ApiOperation({
    summary: 'Get current active session',
    description: 'Returns the session happening right now for the logged-in teacher. Used on dashboard homepage.',
  })
  getCurrentSession(@Request() req) {
    return this.absenceService.getCurrentSession(req.user);
  }

  @Get('teacher/sessions/today')
  @Roles('TEACHER' as AppRole)
  @ApiOperation({
    summary: 'Get all sessions for today',
    description: 'Returns all sessions for today classified as ACTIVE, UPCOMING or DONE.',
  })
  getTodaySessions(@Request() req) {
    return this.absenceService.getTodaySessions(req.user);
  }

  @Get('teacher/history')
  @Roles('TEACHER' as AppRole)
  @ApiOperation({
    summary: 'Get attendance history',
    description: 'Returns all past sessions with attendance summary. Filterable by date, group and subject.',
  })
  @ApiQuery({ name: 'date', required: false, example: '2026-04-01' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiQuery({ name: 'subjectId', required: false })
  getAttendanceHistory(@Request() req, @Query() filters: AttendanceFilterDto) {
    return this.absenceService.getAttendanceHistory(req.user, filters);
  }

  @Get('teacher/session/:sessionId')
  @Roles('TEACHER' as AppRole)
  @ApiOperation({
    summary: 'Get student list for a session',
    description: 'Returns all students in the session group with their current attendance status. Used when teacher opens a session.',
  })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  getSessionStudentList(
    @Param('sessionId') sessionId: string,
    @Request() req,
  ) {
    return this.absenceService.getSessionStudentList(sessionId, req.user);
  }

  @Post('teacher/session/:sessionId')
  @Roles('TEACHER' as AppRole)
  @ApiOperation({
    summary: 'Mark or update attendance for a session',
    description: 'Submit attendance list for a session. Can be called multiple times — updates existing records. Send full list or partial.',
  })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  markAttendance(
    @Param('sessionId') sessionId: string,
    @Body() dto: MarkAttendanceDto,
    @Request() req,
  ) {
    return this.absenceService.markAttendance(sessionId, dto, req.user);
  }

  // ══════════════════════════════════════════════════════════════════
  // STUDENT ROUTES
  // ══════════════════════════════════════════════════════════════════

  @Get('student/my')
  @Roles('STUDENT' as AppRole)
  @ApiOperation({
    summary: 'Get my absences',
    description: 'Student views all their absences across all subjects.',
  })
  getMyAbsences(@Request() req) {
    return this.absenceService.getMyAbsences(req.user);
  }

  @Get('student/my/subject/:subjectId')
  @Roles('STUDENT' as AppRole)
  @ApiOperation({
    summary: 'Get my absences for a specific subject',
    description: 'Returns absences + elimination status for one subject.',
  })
  @ApiParam({ name: 'subjectId', description: 'Subject ID' })
  getMySubjectAbsences(
    @Param('subjectId') subjectId: string,
    @Request() req,
  ) {
    return this.absenceService.getMySubjectAbsences(subjectId, req.user);
  }

  // ══════════════════════════════════════════════════════════════════
  // ADMIN ROUTES
  // ══════════════════════════════════════════════════════════════════

  @Get('admin/student/:studentId')
  @Roles('ADMIN' as AppRole)
  @ApiOperation({
    summary: 'Get full absence report for a student',
    description: 'Admin views all absences and subject statuses for any student.',
  })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  getStudentReport(@Param('studentId') studentId: string) {
    return this.absenceService.getStudentReport(studentId);
  }

  @Patch('admin/:id')
  @Roles('ADMIN' as AppRole)
  @ApiOperation({
    summary: 'Update an absence record',
    description: 'Admin corrects an absence status. Automatically recalculates elimination.',
  })
  @ApiParam({ name: 'id', description: 'Absence ID' })
  updateAbsence(@Param('id') id: string, @Body() dto: UpdateAbsenceDto) {
    return this.absenceService.updateAbsence(id, dto);
  }
}