import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/modules/users/dto/createUser.dto';
import { TimetableQueryDto } from './dto/timetable-query.dto';
import { TimetableService } from './timetable.service';

@ApiTags('timetable')
@ApiBearerAuth()
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  // ── TEACHER: get own timetable ────────────────────────────────────────────
  @Get('teacher')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: 'Get teacher timetable for a week',
    description:
      'Returns sessions grouped by day for the current or specified week. Shows subject, group, level, program, room, start/end time.',
  })
  @ApiQuery({ name: 'weekStart', required: false, example: '2026-05-01' })
  getTeacherTimetable(@Request() req, @Query() query: TimetableQueryDto) {
    return this.timetableService.getTeacherTimetable(req.user, query);
  }

  // ── STUDENT: get own timetable ────────────────────────────────────────────
  @Get('student')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: 'Get student timetable for a week',
    description:
      'Returns sessions grouped by day for the current or specified week. Shows subject, teacher name, room, start/end time.',
  })
  @ApiQuery({ name: 'weekStart', required: false, example: '2026-05-01' })
  getStudentTimetable(@Request() req, @Query() query: TimetableQueryDto) {
    return this.timetableService.getStudentTimetable(req.user, query);
  }

  // ── ADMIN: get timetable for any teacher ──────────────────────────────────
  @Get('teacher/:teacherId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: get timetable for a specific teacher' })
  @ApiParam({ name: 'teacherId', description: 'Teacher record ID' })
  @ApiQuery({ name: 'weekStart', required: false })
  getTeacherTimetableById(
    @Param('teacherId') teacherId: string,
    @Query() query: TimetableQueryDto,
  ) {
    return this.timetableService.getTeacherTimetableById(teacherId, query);
  }

  // ── ADMIN: get timetable for a group ──────────────────────────────────────
  @Get('group/:groupId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: get timetable for a specific group' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiQuery({ name: 'weekStart', required: false })
  getGroupTimetable(
    @Param('groupId') groupId: string,
    @Query() query: TimetableQueryDto,
  ) {
    return this.timetableService.getGroupTimetable(groupId, query);
  }
}




