import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AiService } from '../../../ai/ai.service';
import { extractPdfText } from '../../../ai/pdf.service';

@Injectable()
export class CourseAiService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private aiService: AiService,
  ) {}

  private async cacheGet(key: string): Promise<any> {
    try { return await this.cache.get(key); } catch { return null; }
  }

  private async cacheSet(key: string, value: any): Promise<void> {
    try { await this.cache.set(key, value); } catch { /* Redis unavailable */ }
  }

  async generateSummary(course: any) {
    const key = `summary:${course.id}`;

    const cached = await this.cacheGet(key);
    if (cached) return { source: 'redis', data: cached };

    const rawText = await extractPdfText(course.fileUrl);
    const text = rawText.slice(0, 10000);
    const prompt = `Summarize this course content for exam preparation. Use markdown headings (##) and bullet points (-):\n\n${text}`;

    const result = await this.aiService.generate(prompt);

    await this.cacheSet(key, result);
    return { source: 'ai', data: result };
  }

  async generateQuiz(course: any) {
    const key = `quiz:${course.id}`;

    const cached = await this.cacheGet(key);
    if (cached) return { source: 'redis', data: cached };

    const rawText = await extractPdfText(course.fileUrl);
    const text = rawText.slice(0, 10000);
    const prompt = `Generate 10 multiple-choice questions from this course content. Return ONLY a valid JSON array with no extra text. Each item must have: "question" (string), "options" (array of 4 strings starting with A. B. C. D.), "answer" (single letter A/B/C/D).\n\n${text}`;

    const result = await this.aiService.generate(prompt);

    await this.cacheSet(key, result);
    return { source: 'ai', data: result };
  }
}