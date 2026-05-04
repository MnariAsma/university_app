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
}
