import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AbsenceStatus, Role, User, NotificationType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';

const ELIMINATION_THRESHOLD = 3;

@Injectable()
export class AbsenceService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ─── Helper: get Teacher record from User ──────────────────────────────────
  // session.teacherId = Teacher.id (not User.id)
  // req.user gives us the User — so we need to resolve Teacher first
  private async getTeacherFromUser(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) throw new NotFoundException('Teacher record not found');
    return teacher;
  }

  // ─── Helper: recalculate absence count + elimination after any change ──────
  // Called every time an absence is created or updated
  // Counts all ABSENT records for this student in this subject
  // If count >= 3 → eliminated = true, otherwise false (allows reversal)
  private async recalculateStatus(studentId: string, subjectId: string) {
    const absenceCount = await this.prisma.absence.count({
      where: { studentId, subjectId, status: AbsenceStatus.ABSENT },
    });

    await this.prisma.studentSubjectStatus.upsert({
      where: { studentId_subjectId: { studentId, subjectId } },
      create: { studentId, subjectId, absenceCount, eliminated: absenceCount >= ELIMINATION_THRESHOLD },
      update: { absenceCount, eliminated: absenceCount >= ELIMINATION_THRESHOLD },
    });
  }

  // ─── TEACHER: get current active session ──────────────────────────────────
  // Finds the session happening RIGHT NOW for this teacher
  // "right now" = current time is between startDate and endDate
  async getCurrentSession(user: User) {
    const teacher = await this.getTeacherFromUser(user.id);
    const now = new Date();

    const session = await this.prisma.session.findFirst({
      where: {
        teacherId: teacher.id,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        subject: true,
        group: true,
        room: true,
      },
    });

    if (!session) return { message: 'No active session right now', session: null };

    // Count how many students are in this session's group
    const totalStudents = await this.prisma.student.count({
      where: { groupId: session.groupId },
    });

    // Count how many have been marked already
    const markedCount = await this.prisma.absence.count({
      where: { sessionId: session.id },
    });

    return {
      session,
      totalStudents,
      markedCount,
      isFullyMarked: markedCount === totalStudents,
    };
  }

  // ─── TEACHER: get all sessions for today ──────────────────────────────────
  // Returns sessions grouped by status:
  // ACTIVE = happening right now
  // UPCOMING = starts later today
  // DONE = already ended today
  async getTodaySessions(user: User) {
    const teacher = await this.getTeacherFromUser(user.id);
    const now = new Date();

    // Build start and end of today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await this.prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        startDate: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        subject: true,
        group: true,
        room: true,
      },
      orderBy: { startDate: 'asc' },
    });

    if (sessions.length === 0) {
      return { message: 'No sessions today', sessions: [] };
    }

    // Classify each session
    const classified = await Promise.all(
      sessions.map(async (session) => {
        let status: 'ACTIVE' | 'UPCOMING' | 'DONE';

        if (session.startDate <= now && session.endDate >= now) {
          status = 'ACTIVE';
        } else if (session.startDate > now) {
          status = 'UPCOMING';
        } else {
          status = 'DONE';
        }

        // For DONE sessions: check if attendance was marked
        const markedCount = await this.prisma.absence.count({
          where: { sessionId: session.id },
        });

        const totalStudents = await this.prisma.student.count({
          where: { groupId: session.groupId },
        });

        return {
          ...session,
          status,
          markedCount,
          totalStudents,
          isFullyMarked: markedCount === totalStudents,
        };
      }),
    );

    return { sessions: classified };
  }

  // ─── TEACHER: get student list for a session with attendance status ────────
  // Used when teacher opens a session to mark attendance
  // Returns all students in the group + their current status for this session
  // status = null means not marked yet
  async getSessionStudentList(sessionId: string, user: User) {
    const teacher = await this.getTeacherFromUser(user.id);

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        subject: true,
        group: {
          include: {
            students: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    // Security: verify this session belongs to the logged-in teacher
    if (session.teacherId !== teacher.id) {
      throw new ForbiddenException('This session does not belong to you');
    }

    // Get already marked absences for this session
    const absences = await this.prisma.absence.findMany({
      where: { sessionId },
    });

    // Map studentId → status for quick lookup
    const absenceMap = new Map(absences.map((a) => [a.studentId, a.status]));

    // Merge students with their attendance status
    const students = session.group.students.map((student) => ({
      studentId: student.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      matricule: student.matricule,
      status: absenceMap.get(student.id) ?? null, // null = not marked yet
    }));

    return {
      sessionId: session.id,
      subject: session.subject.name,
      group: session.group.name,
      startDate: session.startDate,
      endDate: session.endDate,
      students,
    };
  }

  // ─── TEACHER: mark or update attendance for a session ─────────────────────
  // Teacher sends full list of { studentId, status }
  // We upsert each record (create if not exists, update if exists)
  // Then recalculate elimination status for each absent student
  async markAttendance(sessionId: string, dto: MarkAttendanceDto, user: User) {
    const teacher = await this.getTeacherFromUser(user.id);

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');

    if (session.teacherId !== teacher.id) {
      throw new ForbiddenException('This session does not belong to you');
    }

    // Upsert each attendance entry
    await Promise.all(
      dto.attendances.map((entry) =>
        this.prisma.absence.upsert({
          where: {
            studentId_sessionId: {
              studentId: entry.studentId,
              sessionId,
            },
          },
          create: {
            studentId: entry.studentId,
            subjectId: session.subjectId,
            sessionId,
            status: entry.status,
          },
          update: {
            status: entry.status,
          },
        }),
      ),
    );

    // Notify students marked as ABSENT
    for (const entry of dto.attendances) {
      if (entry.status === AbsenceStatus.ABSENT) {
        const student = await this.prisma.student.findUnique({
          where: { id: entry.studentId },
          select: { userId: true },
        });
        if (student) {
          await this.notificationsService.createNotification({
            userId: student.userId,
            title: 'Nouvelle Absence',
            message: `Vous avez été marqué absent en session.`,
            type: NotificationType.ABSENCE,
            redirectLink: '/presence',
          });
        }
      }
    }

    // Recalculate elimination for each student that was submitted
    const uniqueStudentIds = [...new Set(dto.attendances.map((e) => e.studentId))];
    await Promise.all(
      uniqueStudentIds.map((studentId) =>
        this.recalculateStatus(studentId, session.subjectId),
      ),
    );

    return { message: 'Attendance marked successfully' };
  }

  // ─── TEACHER: get history of sessions with filters ─────────────────────────
  // Returns all past sessions for this teacher
  // Optional filters: date, groupId, subjectId
  async getAttendanceHistory(user: User, filters: AttendanceFilterDto) {
    const teacher = await this.getTeacherFromUser(user.id);

    // Build date filter if date param provided
    let dateFilter = {};
    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      dateFilter = { startDate: { gte: start, lte: end } };
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        endDate: { lt: new Date() }, // only past sessions
        ...(filters.groupId && { groupId: filters.groupId }),
        ...(filters.subjectId && { subjectId: filters.subjectId }),
        ...dateFilter,
      },
      include: {
        subject: true,
        group: true,
        room: true,
      },
      orderBy: { startDate: 'desc' },
    });

    // For each session add attendance summary
    const result = await Promise.all(
      sessions.map(async (session) => {
        const absences = await this.prisma.absence.groupBy({
          by: ['status'],
          where: { sessionId: session.id },
          _count: { status: true },
        });

        const summary = {
          PRESENT: 0,
          ABSENT: 0,
          EXCUSED: 0,
        };

        absences.forEach((a) => {
          summary[a.status] = a._count.status;
        });

        const totalStudents = await this.prisma.student.count({
          where: { groupId: session.groupId },
        });

        return {
          ...session,
          summary,
          totalStudents,
          isFullyMarked: Object.values(summary).reduce((a, b) => a + b, 0) === totalStudents,
        };
      }),
    );

    return { sessions: result };
  }

  // ─── STUDENT: get all my absences ─────────────────────────────────────────
  // Student sees their own absences across all subjects
  async getMyAbsences(user: User) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });
    if (!student) throw new NotFoundException('Student record not found');

    return this.prisma.absence.findMany({
      where: { studentId: student.id, status: AbsenceStatus.ABSENT },
      include: { subject: true, session: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── STUDENT: get absences per subject + elimination status ───────────────
  async getMySubjectAbsences(subjectId: string, user: User) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });
    if (!student) throw new NotFoundException('Student record not found');

    const [absences, status] = await Promise.all([
      this.prisma.absence.findMany({
        where: { studentId: student.id, subjectId, status: AbsenceStatus.ABSENT },
        include: { session: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentSubjectStatus.findUnique({
        where: { studentId_subjectId: { studentId: student.id, subjectId } },
      }),
    ]);

    return {
      subjectId,
      absenceCount: status?.absenceCount ?? 0,
      eliminated: status?.eliminated ?? false,
      absences,
    };
  }

  // ─── ADMIN: get full absence report for any student ───────────────────────
  async getStudentReport(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const [absences, statuses] = await Promise.all([
      this.prisma.absence.findMany({
        where: { studentId },
        include: { subject: true, session: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentSubjectStatus.findMany({
        where: { studentId },
        include: { subject: true },
      }),
    ]);

    return { absences, statuses };
  }

  // ─── ADMIN: update a single absence ───────────────────────────────────────
  // After update, recalculate elimination (allows reversal if corrected)
  async updateAbsence(id: string, dto: UpdateAbsenceDto) {
    const absence = await this.prisma.absence.findUnique({ where: { id } });
    if (!absence) throw new NotFoundException('Absence not found');

    await this.prisma.absence.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.recalculateStatus(absence.studentId, absence.subjectId);

    return { message: 'Absence updated successfully' };
  }
}