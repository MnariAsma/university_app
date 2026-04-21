import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateLevelDto } from './dto/createLevel.dto';
import { UpdateLevelDto } from './dto/updateLevel.dto';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  create(createLevelDto: CreateLevelDto) {
    return this.prisma.level.create({
      data: createLevelDto,
    });
  }

  findAll() {
    return this.prisma.level.findMany();
  }

  findOne(id: string) {
    return this.prisma.level.findUnique({
      where: { id },
    });
  }

  update(id: string, updateLevelDto: UpdateLevelDto) {
    return this.prisma.level.update({
      where: { id },
      data: updateLevelDto,
    });
  }

  remove(id: string) {
    return this.prisma.level.delete({
      where: { id },
    });
  }
}
