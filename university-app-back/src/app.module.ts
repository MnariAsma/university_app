import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AdminModule } from './modules/admin/admin.module';
import { DepartmentModule } from './modules/department/department.module';
import { SubjectModule } from './modules/subject/subject.module';
import { ProgramModule } from './modules/program/program.module';
import { CourseModule } from './modules/course/course.module';
import { StudentModule } from './modules/student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MulterModule.register({ dest: './uploads' }),
    AuthModule,
    UserModule,
    TeachersModule,
    AdminModule,
    DepartmentModule,
    SubjectModule,
    ProgramModule,
    CourseModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
