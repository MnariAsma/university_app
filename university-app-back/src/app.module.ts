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
import { GradeModule } from './modules/grade/grade.module';
import { AbsenceModule } from './modules/absence/absence.module';
import { TimetableModule } from './modules/timetable/timetable.module';

import { LevelModule } from './modules/level/level.module';
import { GroupModule } from './modules/group/group.module';
import { RoomModule } from './modules/room/room.module';
import { CourseModule } from './modules/course/course.module';
import { StudentModule } from './modules/student/student.module';
import { MailModule } from './modules/mail/mail.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { RequestsModule } from './modules/requests/requests.module';

import { AppCacheModule } from './cache/cache.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { AiModule } from './ai/ai.module';
import {CourseAiModule} from "./modules/course/course-ai/course-ai.module";

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
    GradeModule,
    AbsenceModule,
    TimetableModule,

    LevelModule,
    GroupModule,
    RoomModule,

    CourseModule,
    StudentModule,
    MailModule,
    AnnouncementsModule,
    RequestsModule,
    AppCacheModule,
    AiModule,
    CourseAiModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
