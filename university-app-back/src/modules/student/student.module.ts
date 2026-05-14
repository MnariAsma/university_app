import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { PrismaService } from 'src/common/prisma.service';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService, PrismaService, MailService],
  exports: [StudentService],
})
export class StudentModule {}
