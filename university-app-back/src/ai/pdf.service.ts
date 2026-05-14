import * as fs from 'fs';
import { join } from 'path';
import * as path from 'path';

// pdf-parse v2 uses a class-based API: new PDFParse({ data }).getText()
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require('pdf-parse');

export async function extractPdfText(filePath: string): Promise<string> {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : join(process.cwd(), 'uploads', filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`PDF file not found: ${resolved}`);
  }

  const buffer = fs.readFileSync(resolved);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}