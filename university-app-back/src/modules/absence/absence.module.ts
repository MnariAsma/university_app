import { Module } from '@nestjs/common';
import { AbsenceController } from './absence.controller';
import { AbsenceService } from './absence.service';
import { PrismaService } from 'src/common/prisma.service';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AbsenceController],
  providers: [AbsenceService, PrismaService],
  exports: [AbsenceService],
})
export class AbsenceModule {}