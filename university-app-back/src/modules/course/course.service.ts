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