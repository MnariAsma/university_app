import { Module } from '@nestjs/common';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { PrismaService } from 'src/common/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [GradeController],
  providers: [GradeService, PrismaService],
  exports: [GradeService],
})
export class GradeModule {}
