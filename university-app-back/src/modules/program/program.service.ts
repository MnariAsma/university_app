import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateProgramDto } from './dto/createProgram.dto';
import { UpdateProgramDto } from './dto/updateProgram.dto';

@Injectable()
export class ProgramService {
  constructor(private prisma: PrismaService) {}

  create(createProgramDto: CreateProgramDto) {
    return this.prisma.program.create({
      data: createProgramDto,
    });
  }

  findAll() {
    return this.prisma.program.findMany({
      include: {
        department: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.program.findUnique({
      where: { id },
      include: {
        department: true,
        levels: true,
        subjects: true,
      },
    });
  }

  update(id: string, updateProgramDto: UpdateProgramDto) {
    return this.prisma.program.update({
      where: { id },
      data: updateProgramDto,
    });
  }

  remove(id: string) {
    return this.prisma.program.delete({
      where: { id },
    });
  }
}
