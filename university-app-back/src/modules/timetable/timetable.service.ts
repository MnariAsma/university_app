import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { TimetableQueryDto } from './dto/timetable-query.dto';

// ── Helper: get Monday and Sunday of a given week ─────────────────────────────
function getWeekRange(dateStr?: string): { weekStart: Date; weekEnd: Date } {
  const base = dateStr ? new Date(dateStr) : new Date();

  // Get Monday of the week
  const day = base.getDay(); // 0=Sun, 1=Mon, ...6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(base);
  weekStart.setDate(base.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  // Get Sunday of the week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

// ── Helper: group sessions by day ─────────────────────────────────────────────
function groupByDay(sessions: any[]) {
  const days: Record<string, any[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  for (const session of sessions) {
    const dayName = new Date(session.startDate).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    if (days[dayName]) {
      days[dayName].push(session);
    }
  }

  // Sort each day's sessions by start time
  for (const day of Object.keys(days)) {
    days[day].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }

  // Return only days that have sessions
  return Object.entries(days)
    .filter(([, sessions]) => sessions.length > 0)
    .map(([day, sessions]) => ({ day, sessions }));
}

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  // ── TEACHER: get own timetable for a week ─────────────────────────────────
  async getTeacherTimetable(user: User, query: TimetableQueryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.id },
    });
    if (!teacher) throw new NotFoundException('Teacher record not found');

    const { weekStart, weekEnd } = getWeekRange(query.weekStart);

    const sessions = await this.prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        startDate: { gte: weekStart, lte: weekEnd },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        group: {
          select: {
            id: true,
            name: true,
            code: true,
            level: {
              select: {
                id: true,
                name: true,
                program: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
        room: { select: { id: true, name: true, building: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    // Format each session for teacher view
    const formatted = sessions.map((s) => ({
      id: s.id,
      type: s.type,
      startDate: s.startDate,
      endDate: s.endDate,
      dayName: new Date(s.startDate).toLocaleDateString('en-US', { weekday: 'long' }),
      date: new Date(s.startDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      startTime: new Date(s.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      endTime: new Date(s.endDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      subject: s.subject,
      group: s.group,
      room: s.room,
    }));

    return {
      weekStart,
      weekEnd,
      timetable: groupByDay(formatted),
    };
  }

  // ── STUDENT: get own timetable for a week ─────────────────────────────────
  async getStudentTimetable(user: User, query: TimetableQueryDto) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });
    if (!student) throw new NotFoundException('Student record not found');

    const { weekStart, weekEnd } = getWeekRange(query.weekStart);

    const sessions = await this.prisma.session.findMany({
      where: {
        groupId: student.groupId,
        startDate: { gte: weekStart, lte: weekEnd },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        room: { select: { id: true, name: true, building: true } },
        teacher: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // Format each session for student view
    const formatted = sessions.map((s) => ({
      id: s.id,
      type: s.type,
      startDate: s.startDate,
      endDate: s.endDate,
      dayName: new Date(s.startDate).toLocaleDateString('en-US', { weekday: 'long' }),
      date: new Date(s.startDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      startTime: new Date(s.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      endTime: new Date(s.endDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      subject: s.subject,
      room: s.room,
      teacher: {
        firstName: s.teacher.user.firstName,
        lastName: s.teacher.user.lastName,
      },
    }));

    return {
      weekStart,
      weekEnd,
      timetable: groupByDay(formatted),
    };
  }

  // ── ADMIN: get timetable for any teacher ──────────────────────────────────
  async getTeacherTimetableById(teacherId: string, query: TimetableQueryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const { weekStart, weekEnd } = getWeekRange(query.weekStart);

    const sessions = await this.prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        startDate: { gte: weekStart, lte: weekEnd },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        group: {
          select: {
            id: true,
            name: true,
            code: true,
            level: {
              select: {
                id: true,
                name: true,
                program: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
        room: { select: { id: true, name: true, building: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      type: s.type,
      startDate: s.startDate,
      endDate: s.endDate,
      dayName: new Date(s.startDate).toLocaleDateString('en-US', { weekday: 'long' }),
      date: new Date(s.startDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      startTime: new Date(s.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      endTime: new Date(s.endDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      subject: s.subject,
      group: s.group,
      room: s.room,
    }));

    return {
      weekStart,
      weekEnd,
      timetable: groupByDay(formatted),
    };
  }

  // ── ADMIN: get timetable for a group ──────────────────────────────────────
  async getGroupTimetable(groupId: string, query: TimetableQueryDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Group not found');

    const { weekStart, weekEnd } = getWeekRange(query.weekStart);

    const sessions = await this.prisma.session.findMany({
      where: {
        groupId,
        startDate: { gte: weekStart, lte: weekEnd },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        room: { select: { id: true, name: true, building: true } },
        teacher: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      type: s.type,
      startDate: s.startDate,
      endDate: s.endDate,
      dayName: new Date(s.startDate).toLocaleDateString('en-US', { weekday: 'long' }),
      date: new Date(s.startDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      startTime: new Date(s.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      endTime: new Date(s.endDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      subject: s.subject,
      room: s.room,
      teacher: {
        firstName: s.teacher.user.firstName,
        lastName: s.teacher.user.lastName,
      },
    }));

    return {
      weekStart,
      weekEnd,
      timetable: groupByDay(formatted),
    };
  }
}