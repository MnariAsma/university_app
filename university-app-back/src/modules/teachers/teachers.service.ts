import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateTeacherDto } from './dto/createTeacher.dto';
import { UserService } from '../users/users.service';
import { Role } from '../users/dto/createUser.dto';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) { }

  async create(dto: CreateTeacherDto) {
    const user = await this.userService.createUser({
      email: dto.email,
      password: dto.password,
      role: Role.TEACHER,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      photo: dto.photo,
      active: true,
    });


    const lastTeacher = await this.prisma.teacher.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { matricule: true },
    });

    let nextNumber = 1;
    if (lastTeacher?.matricule) {
      const parts = lastTeacher.matricule.split('-');
      const numberPart = parseInt(parts[1]);
      if (!isNaN(numberPart)) {
        nextNumber = numberPart + 1;
      }
    }
    const matricule = `TCH-${nextNumber.toString().padStart(6, '0')}`;

    const teacher = await this.prisma.teacher.create({
      data: {
        userId: user.id,
        departmentId: dto.departmentId,
        specialty: dto.specialty,
        grade: dto.grade,
        matricule,
      },
      include: {
        user: true,
        department: true,
      },
    });

    return teacher;
  }

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: true,
        department: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}