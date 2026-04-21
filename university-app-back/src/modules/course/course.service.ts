import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { createCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

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

  return this.prisma.course.create({
    data: {
      title: dto.title,
      description: dto.description,
      content: dto.content,
      subjectId: dto.subjectId,
      teacherId: teacher.id,
      fileUrl: file ? file.filename : null,
      type: dto.type,
    },
  });
}

  async findAllByTeacher(teacherId: string) {
    return this.prisma.course.findMany({
      where: { teacherId },
      include: { subject: true },
    });
  }


  async findForStudent(programId: string, semester: number) {
    return this.prisma.course.findMany({
      where: {
        published: true,
        subject: {
          programId,
          semester,
        },
      },
      include: {
        subject: true,
        teacher: true,
      },
    });
  }

  async update(id: string, dto: UpdateCourseDto, file: Express.Multer.File | undefined, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course || course.teacherId !== teacherId) {
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


  async delete(id: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course || course.teacherId !== teacherId) {
      throw new ForbiddenException('Not allowed');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }
}