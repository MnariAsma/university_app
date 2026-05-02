import { Module } from '@nestjs/common';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  imports: [],
  providers: [GradeService, PrismaService],
  controllers: [GradeController],
})
export class GradeModule {}
