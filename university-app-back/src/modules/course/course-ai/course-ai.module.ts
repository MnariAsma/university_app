import { Module } from '@nestjs/common';
import { CourseAiService } from './course-ai.service';
import { CourseAiController } from './course-ai.controller';
import { AiModule } from '../../../ai/ai.module';
import { AppCacheModule } from '../../../cache/cache.module';
import { PrismaService } from '../../../common/prisma.service';

@Module({
  imports: [AiModule, AppCacheModule],
  controllers: [CourseAiController],
  providers: [CourseAiService, PrismaService],
})
export class CourseAiModule {}