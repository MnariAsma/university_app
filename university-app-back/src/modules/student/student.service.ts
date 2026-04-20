import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UpdateStudentDto } from './dto/updateStudent.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            photo: true,
            active: true,
          },
        },
        department: true,
        program: true,
        group: true,
        academicYear: true,
      },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            photo: true,
            active: true,
          },
        },
        department: true,
        program: true,
        group: true,
        academicYear: true,
      },
    });

    if (!student) throw new NotFoundException(`Student with id ${id} not found`);
    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException(`Student with id ${id} not found`);

    const { firstName, lastName, phone, ...studentFields } = dto;

    // Update user fields if provided
    if (firstName !== undefined || lastName !== undefined || phone !== undefined) {
      await this.prisma.user.update({
        where: { id: student.userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(phone !== undefined && { phone }),
        },
      });
    }

    // Update student-specific fields if provided
    return this.prisma.student.update({
      where: { id },
      data: studentFields,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            photo: true,
            active: true,
          },
        },
        department: true,
        program: true,
        group: true,
        academicYear: true,
      },
    });
  }

  async remove(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException(`Student with id ${id} not found`);

    // Deleting the user cascades to the student (onDelete: Cascade in schema)
    return this.prisma.user.delete({ where: { id: student.userId } });
  }
}
