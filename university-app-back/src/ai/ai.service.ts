import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async generate(prompt: string) {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response;
  }
}