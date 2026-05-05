import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { createCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

async create(
  dto: createCourseDto,
  file: Express.Multer.File | undefined,
  userId: string,
) {
  const teacher = await this.prisma.teacher.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!teacher) {
    throw new Error("Teacher not found for this user");
  }

  const course = await this.prisma.course.create({
    data: {
      title: dto.title,
      description: dto.description,
      content: dto.content,
      subjectId: dto.subjectId,
      teacherId: teacher.id,
      fileUrl: file ? file.filename : null,
      type: dto.type,
    },
    include: { subject: true },
  });

  // Notify all students in this subject's program
  const subject = await this.prisma.subject.findUnique({
    where: { id: dto.subjectId },
  });

  if (subject && subject.programId) {
    const students = await this.prisma.student.findMany({
      where: { programId: subject.programId },
      select: { userId: true }
    });

    for (const student of students) {
      await this.notificationsService.createNotification({
        userId: student.userId,
        title: 'Nouveau Cours Ajouté',
        message: `Le professeur a ajouté un nouveau cours : ${course.title} dans la matière ${subject.name}.`,
        type: NotificationType.COURSE,
        redirectLink: '/courses',
      });
    }
  }

  return course;
}

  async findAllByTeacher(userId: string) {
    console.log(`[findAllByTeacher] Called with userId: ${userId}`);
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId },
    });
    
    if (!teacher) {
      console.log(`[findAllByTeacher] No teacher found for userId: ${userId}`);
      return [];
    }
    
    const courses = await this.prisma.course.findMany({
      where: { teacherId: teacher.id },
      include: { subject: true },
    });
    
    console.log(`[findAllByTeacher] Found ${courses.length} courses for teacher.id: ${teacher.id}`);
    return courses;
  }


  async findForStudent(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new ForbiddenException('Student profile not found');
    }

    return this.prisma.course.findMany({
      where: {
        published: true,
        subject: {
          programId: student.programId,
        },
      },
      include: {
        subject: true,
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, dto: UpdateCourseDto, file: Express.Multer.File | undefined, userId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId },
    });
    
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course || !teacher || course.teacherId !== teacher.id) {
      throw new ForbiddenException('Not allowed');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...dto,
        ...(file && { fileUrl: file.filename }),
      },
    });
  }


  async delete(id: string, userId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId },
    });
    
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course || !teacher || course.teacherId !== teacher.id) {
      throw new ForbiddenException('Not allowed');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }
}