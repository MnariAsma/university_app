import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateStudentDto } from './dto/createStudent.dto';
import { UpdateStudentDto } from './dto/updateStudent.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  private generatePassword(length = 10): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }

  async create(dto: CreateStudentDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const plainPassword = this.generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const lastStudent = await this.prisma.student.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { matricule: true },
    });

    let nextNumber = 1;
    if (lastStudent?.matricule) {
      const parts = lastStudent.matricule.split('-');
      const numberPart = parseInt(parts[1]);
      if (!isNaN(numberPart)) nextNumber = numberPart + 1;
    }
    const matricule = `STD-${nextNumber.toString().padStart(6, '0')}`;

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: Role.STUDENT,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          active: true,
        },
      });

      await tx.student.create({
        data: {
          userId: user.id,
          matricule,
          departmentId: dto.departmentId,
          programId: dto.programId,
          groupId: dto.groupId,
          academicYearId: dto.academicYearId,
        },
      });
    });

    // TODO: replace with real email service once mail is configured
    await this.mailService.sendCredentials(dto.email, dto.firstName, plainPassword, 'STUDENT');


    return { message: 'Student created successfully. Credentials sent to their email.' };
  }

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
