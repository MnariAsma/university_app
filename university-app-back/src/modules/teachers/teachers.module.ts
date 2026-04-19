import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeacherService } from './teachers.service';
import { DepartmentService } from '../department/department.service';
import { PrismaService } from 'src/common/prisma.service';
import { UserService } from '../users/users.service';

@Module({
  providers: [
    TeacherService,
    PrismaService,
    UserService,
    DepartmentService,
  ],
  controllers: [TeachersController],
  exports: [TeacherService],
})
export class TeachersModule {}
