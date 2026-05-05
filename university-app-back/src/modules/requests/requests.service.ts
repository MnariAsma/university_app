import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRequestDto, file?: Express.Multer.File) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (dto.category === 'INTERNSHIP' && !file) {
      throw new BadRequestException('Internship documents require a file upload');
    }

    if (dto.type === 'CERTIFICATE_SUCCESS' && !dto.academicYearId) {
      throw new BadRequestException('Academic year must be specified for Certificate of Success');
    }

    let actualAcademicYearId = dto.academicYearId;

    if (dto.type === 'CERTIFICATE_ATTENDANCE') {
      const activeYear = await this.prisma.academicYear.findFirst({
        where: { active: true },
      });
      if (!activeYear) {
        throw new BadRequestException('No active academic year found');
      }
      actualAcademicYearId = activeYear.id;

      if (!dto.reason) {
        throw new BadRequestException('Reason must be provided for Certificate of Attendance');
      }
    }

    const studentFileUrl = file ? `/uploads/${file.filename}` : null;

    return this.prisma.documentRequest.create({
      data: {
        studentId: student.id,
        category: dto.category,
        type: dto.type,
        academicYearId: actualAcademicYearId,
        reason: dto.reason,
        studentFileUrl,
      },
    });
  }

  async findMyRequests(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return [];
    }

    return this.prisma.documentRequest.findMany({
      where: { studentId: student.id },
      include: {
        academicYear: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.documentRequest.findMany({
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            program: true,
            group: true,
          },
        },
        academicYear: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto, file?: Express.Multer.File) {
    const request = await this.prisma.documentRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const adminFileUrl = file ? `/uploads/${file.filename}` : request.adminFileUrl;

    return this.prisma.documentRequest.update({
      where: { id },
      data: {
        status: dto.status,
        adminFileUrl,
      },
    });
  }

  async getAcademicYears() {
    return this.prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async deleteRequest(id: string, userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');

    const request = await this.prisma.documentRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.studentId !== student.id) {
      throw new BadRequestException('You can only delete your own requests');
    }

    return this.prisma.documentRequest.delete({ where: { id } });
  }
}
