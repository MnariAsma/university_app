import { Injectable, NotFoundException } from '@nestjs/common';
import { AbsenceStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentDashboard(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
        department: { select: { name: true } },
        program: { select: { name: true } },
        group: {
          include: {
            level: { select: { name: true } },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const now = new Date();

    const [gradeAggregate, absenceCount, unreadNotifications, activeCourses, eliminationRisks, nextSession, recentAnnouncements] =
      await Promise.all([
        this.prisma.grade.aggregate({
          where: { studentId: student.id },
          _avg: { value: true },
        }),
        this.prisma.absence.count({
          where: {
            studentId: student.id,
            status: AbsenceStatus.ABSENT,
          },
        }),
        this.prisma.notification.count({
          where: { userId, read: false },
        }),
        this.prisma.course.count({
          where: {
            published: true,
            subject: {
              programId: student.programId,
            },
          },
        }),
        this.prisma.studentSubjectStatus.count({
          where: {
            studentId: student.id,
            eliminated: true,
          },
        }),
        this.prisma.session.findFirst({
          where: {
            groupId: student.groupId,
            startDate: { gte: now },
          },
          include: {
            subject: { select: { name: true } },
            room: { select: { name: true } },
            teacher: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { startDate: 'asc' },
        }),
        this.prisma.announcement.findMany({
          where: {
            OR: [
              { targetProgramId: null, targetLevelId: null },
              { targetProgramId: student.programId, targetLevelId: null },
              {
                targetProgramId: student.programId,
                targetLevelId: student.group.levelId,
              },
            ],
          },
          include: {
            teacher: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
      ]);

    return {
      profile: {
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        program: student.program.name,
        department: student.department.name,
        level: student.group.level.name,
        group: student.group.name,
      },
      stats: {
        averageGrade: gradeAggregate._avg.value,
        absences: absenceCount,
        activeCourses,
        unreadNotifications,
        eliminationRisks,
      },
      nextSession: nextSession
        ? {
            title: nextSession.title ?? nextSession.subject.name,
            subject: nextSession.subject.name,
            room: nextSession.room?.name ?? null,
            teacher: `${nextSession.teacher.user.firstName} ${nextSession.teacher.user.lastName}`,
            startDate: nextSession.startDate,
            endDate: nextSession.endDate,
          }
        : null,
      recentAnnouncements: recentAnnouncements.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        type: announcement.type,
        author: `${announcement.teacher.user.firstName} ${announcement.teacher.user.lastName}`,
        createdAt: announcement.createdAt,
      })),
    };
  }

  async getTeacherDashboard(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true,
        department: { select: { name: true } },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [courses, subjectLinks, todaySessions, nextSession, unreadNotifications, announcementCount, recentAnnouncements, sessionGroups] =
      await Promise.all([
        this.prisma.course.count({ where: { teacherId: teacher.id } }),
        this.prisma.teacherSubject.findMany({
          where: { teacherId: teacher.id },
          select: { subjectId: true, programId: true, levelId: true },
        }),
        this.prisma.session.count({
          where: {
            teacherId: teacher.id,
            startDate: { gte: startOfDay, lte: endOfDay },
          },
        }),
        this.prisma.session.findFirst({
          where: {
            teacherId: teacher.id,
            startDate: { gte: now },
          },
          include: {
            subject: { select: { name: true } },
            group: { select: { name: true } },
            room: { select: { name: true } },
          },
          orderBy: { startDate: 'asc' },
        }),
        this.prisma.notification.count({
          where: { userId, read: false },
        }),
        this.prisma.announcement.count({ where: { teacherId: teacher.id } }),
        this.prisma.announcement.findMany({
          where: { teacherId: teacher.id },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true,
          },
        }),
        this.prisma.session.findMany({
          where: { teacherId: teacher.id },
          select: { groupId: true },
        }),
      ]);

    const groupIds = [...new Set(sessionGroups.map((session) => session.groupId))];
    const assignmentFilters = subjectLinks.flatMap((link) => {
      if (link.programId && link.levelId) {
        return [{ programId: link.programId, group: { levelId: link.levelId } }];
      }

      if (link.programId) {
        return [{ programId: link.programId }];
      }

      return [];
    });

    const studentSources = await Promise.all([
      groupIds.length
        ? this.prisma.student.findMany({
            where: { groupId: { in: groupIds } },
            select: { id: true },
          })
        : Promise.resolve([]),
      assignmentFilters.length
        ? this.prisma.student.findMany({
            where: { OR: assignmentFilters },
            select: { id: true },
          })
        : Promise.resolve([]),
    ]);

    const trackedStudents = new Set(
      studentSources.flat().map((student) => student.id),
    ).size;

    return {
      profile: {
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        department: teacher.department.name,
        specialty: teacher.specialty,
      },
      stats: {
        courses,
        subjects: new Set(subjectLinks.map((link) => link.subjectId)).size,
        students: trackedStudents,
        todaySessions,
        unreadNotifications,
        announcements: announcementCount,
      },
      nextSession: nextSession
        ? {
            title: nextSession.title ?? nextSession.subject.name,
            subject: nextSession.subject.name,
            group: nextSession.group.name,
            room: nextSession.room?.name ?? null,
            startDate: nextSession.startDate,
            endDate: nextSession.endDate,
          }
        : null,
      recentAnnouncements,
    };
  }
}