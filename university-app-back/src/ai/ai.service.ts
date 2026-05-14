import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(private config: ConfigService) {}

  async generate(prompt: string): Promise<string> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY is not configured in .env');
    }

    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    });

    const doFetch = () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);
      return fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body,
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));
    };

    let response: Response;
    try {
      response = await doFetch();
    } catch {
      // One retry after a short delay
      await new Promise(r => setTimeout(r, 2000));
      response = await doFetch();
    }

    if (!response.ok) {
      const err = await response.text();
      throw new InternalServerErrorException(`Groq API error: ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}