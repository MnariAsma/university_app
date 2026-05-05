import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAnnouncementDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    const teacherId = teacher.id;

    // 1. Create the announcement
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type || 'INFO',
        teacherId,
        targetProgramId: dto.targetProgramId,
        targetLevelId: dto.targetLevelId,
      },
    });

    // 2. Find target students
    let studentIds: string[] = [];

    if (dto.targetProgramId && dto.targetLevelId) {
      // Find students in this program and level
      const students = await this.prisma.student.findMany({
        where: {
          programId: dto.targetProgramId,
          group: {
            levelId: dto.targetLevelId,
          },
        },
        select: { userId: true },
      });
      studentIds = students.map((s) => s.userId);
    } else {
      // Find all students taught by this teacher
      // A teacher teaches a subject to a program/level or generally via TeacherSubject
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId },
        select: {
          programId: true,
          levelId: true,
        },
      });

      const conditions: any[] = [];
      for (const ts of teacherSubjects) {
        if (ts.programId && ts.levelId) {
          conditions.push({
            programId: ts.programId,
            group: { levelId: ts.levelId },
          });
        } else if (ts.programId) {
          conditions.push({ programId: ts.programId });
        }
      }

      if (conditions.length > 0) {
        const students = await this.prisma.student.findMany({
          where: { OR: conditions },
          select: { userId: true },
        });
        studentIds = students.map((s) => s.userId);
      } else {
        // Fallback: If no specific program/level in TeacherSubject, they might just teach groups via sessions
        const sessions = await this.prisma.session.findMany({
          where: { teacherId },
          select: { groupId: true },
        });
        const groupIds = sessions.map((s) => s.groupId);
        if (groupIds.length > 0) {
          const students = await this.prisma.student.findMany({
            where: { groupId: { in: groupIds } },
            select: { userId: true },
          });
          studentIds = students.map((s) => s.userId);
        }
      }
    }

    // Deduplicate studentIds
    studentIds = [...new Set(studentIds)];

    // 3. Create notifications
    if (studentIds.length > 0) {
      const notifications = studentIds.map((userId) => ({
        title: dto.title,
        message: dto.content,
        type: (dto.type === 'ABSENCE' ? 'ABSENCE' : dto.type === 'EXAM' ? 'EXAM' : 'INFO') as NotificationType,
        userId,
      }));

      await this.prisma.notification.createMany({
        data: notifications,
      });
    }

    return announcement;
  }

  async findAllByTeacher(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.announcement.findMany({
      where: { teacherId: teacher.id },
      include: {
        program: { select: { name: true } },
        level: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForStudent(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { group: true },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    // 1. Fetch Teacher Announcements targeting this student's program/level or global (null)
    // Wait, earlier the logic for targeted announcements was:
    // It targets specific program/level. If not provided, it targets all students of the teacher.
    // For simplicity from student perspective: get announcements where targetProgramId is null or student.programId
    // AND targetLevelId is null or student.group.levelId
    const teacherAnnouncements = await this.prisma.announcement.findMany({
      where: {
        OR: [
          { targetProgramId: null, targetLevelId: null },
          { targetProgramId: student.programId, targetLevelId: null },
          { targetProgramId: student.programId, targetLevelId: student.group?.levelId },
        ],
      },
      include: {
        teacher: {
          include: { user: true },
        },
      },
    });

    // 2. Fetch Administration News
    const adminNews = await this.prisma.news.findMany({
      where: {
        published: true,
        OR: [
          { programId: null },
          { programId: student.programId },
        ],
      },
      include: {
        admin: {
          include: { user: true },
        },
      },
    });

    // 3. Map to common format
    const combined = [
      ...teacherAnnouncements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type,
        source: 'TEACHER',
        author: `${a.teacher.user.firstName} ${a.teacher.user.lastName}`,
        createdAt: a.createdAt,
      })),
      ...adminNews.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        type: 'INFO',
        source: 'ADMIN',
        author: `${n.admin.user.firstName} ${n.admin.user.lastName}`,
        createdAt: n.createdAt,
      }))
    ];

    // Sort descending by date
    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return combined;
  }
}
