import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CourseModule } from './modules/course/course.module';
import { MulterModule } from '@nestjs/platform-express';
import { TeachersModule } from './modules/teachers/teachers.module';
import { UserModule } from './modules/users/users.module';
import { DepartmentModule } from './modules/department/department.module';
import { SubjectModule } from './modules/subject/subject.module';
import { ProgramModule } from './modules/program/program.module';
import { ConfigModule } from '@nestjs/config';
import { diskStorage } from 'multer';

@Module({
  imports: [
    AuthModule,
    CourseModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

    TeachersModule,
    UserModule,
    DepartmentModule,
    SubjectModule,
    ProgramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
