import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateSubjectDto } from './dto/createSubject.dto';
import { UpdateSubjectDto } from './dto/updateSubject.dto';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: createSubjectDto,
    });
  }

  findAll() {
    return this.prisma.subject.findMany({
      include: {
        program: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        program: true,
        teachers: {
          include: {
            teacher: {
              include: {
                user: true
              }
            }
          }
        }
      },
    });
  }

  update(id: string, updateSubjectDto: UpdateSubjectDto) {
    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
    });
  }

  remove(id: string) {
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
