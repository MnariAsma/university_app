import { Controller, Post, Get, Param, NotFoundException } from '@nestjs/common';
import { CourseAiService } from './course-ai.service';
import { PrismaService } from '../../../common/prisma.service';

@Controller('courses')
export class CourseAiController {
  constructor(
    private courseAi: CourseAiService,
    private prisma: PrismaService,
  ) {}

  private async getCourseOrFail(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    if (!course.fileUrl) throw new NotFoundException(`Course ${id} has no file attached`);
    return {
      id: course.id,
      fileUrl: course.fileUrl,
    };
  }

  @Post(':id/summary')
  async summary(@Param('id') id: string) {
    const course = await this.getCourseOrFail(id);
    return this.courseAi.generateSummary(course);
  }

  @Post(':id/quiz')
  async quiz(@Param('id') id: string) {
    const course = await this.getCourseOrFail(id);
    return this.courseAi.generateQuiz(course);
  }

  @Get(':id/ai-summary')
  async getSummary(@Param('id') id: string) {
    const course = await this.getCourseOrFail(id);
    const result = await this.courseAi.generateSummary(course);
    return result.data || result;
  }

  @Get(':id/ai-quiz')
  async getQuiz(@Param('id') id: string) {
    const course = await this.getCourseOrFail(id);
    const result = await this.courseAi.generateQuiz(course);
    return result.data || result;
  }
}