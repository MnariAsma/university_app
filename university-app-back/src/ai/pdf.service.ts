import * as fs from 'fs';

const pdfParse = require('pdf-parse');

export async function extractPdfText(path: string) {
  const buffer = fs.readFileSync(path);
  const data = await pdfParse(buffer);
  return data.text;
}