import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CourseAiService } from '../modules/course/course-ai/course-ai.service';
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="jest" />
import { AiService } from '../ai/ai.service';

// Mock PDF extraction function

// Mock PDF extraction function (if used in CourseAiService, adjust import path as needed)
jest.mock('../ai/pdf.service', () => ({
  extractPdfText: jest.fn(() => 'mocked pdf text'),
}));

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockAiService = {
  generate: jest.fn(),
};

describe('CourseAiService', () => {
  let service: CourseAiService;
  let cache: typeof mockCache;
  let aiService: typeof mockAiService;

  const mockCourse = { id: 1, name: 'Math', filePath: 'test.pdf' };
  const summaryKey = `summary:${mockCourse.id}`;
  const quizKey = `quiz:${mockCourse.id}`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseAiService,
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<CourseAiService>(CourseAiService);
    cache = module.get(CACHE_MANAGER);
    aiService = module.get(AiService);
    jest.clearAllMocks();
  });

  describe('generateSummary', () => {
    it('should call AI and cache when cache is empty', async () => {
      cache.get.mockResolvedValueOnce(null);
      aiService.generate.mockResolvedValueOnce('summary result');

      const result = await service.generateSummary(mockCourse);

      expect(cache.get).toHaveBeenCalledWith(summaryKey);
      expect(aiService.generate).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith(summaryKey, 'summary result');
      expect(result).toEqual({ source: 'ai', data: 'summary result' });
    });

    it('should return cached summary and not call AI', async () => {
      cache.get.mockResolvedValueOnce('cached summary');

      const result = await service.generateSummary(mockCourse);

      expect(cache.get).toHaveBeenCalledWith(summaryKey);
      expect(aiService.generate).not.toHaveBeenCalled();
      expect(result).toEqual({ source: 'redis', data: 'cached summary' });
    });
  });

  describe('generateQuiz', () => {
    it('should call AI and cache when cache is empty', async () => {
      cache.get.mockResolvedValueOnce(null);
      aiService.generate.mockResolvedValueOnce('quiz result');

      const result = await service.generateQuiz(mockCourse);

      expect(cache.get).toHaveBeenCalledWith(quizKey);
      expect(aiService.generate).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith(quizKey, 'quiz result');
      expect(result).toEqual({ source: 'ai', data: 'quiz result' });
    });

    it('should return cached quiz and not call AI', async () => {
      cache.get.mockResolvedValueOnce('cached quiz');

      const result = await service.generateQuiz(mockCourse);

      expect(cache.get).toHaveBeenCalledWith(quizKey);
      expect(aiService.generate).not.toHaveBeenCalled();
      expect(result).toEqual({ source: 'redis', data: 'cached quiz' });
    });
  });
});
