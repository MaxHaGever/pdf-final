// src/utils/fileToDataUrl.ts

import fs from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
};

export function fileToDataUrl(filePath: string): string {
  const normalized = filePath.startsWith('/uploads/')
    ? path.resolve(process.cwd(), `.${filePath}`)
    : filePath;

  const abs = path.resolve(normalized);
  if (!fs.existsSync(abs)) {
    throw new Error(`[fileToDataUrl] File not found at "${abs}"`);
  }

  const ext = path.extname(abs).toLowerCase();
  const mimeType = MIME_MAP[ext] || 'application/octet-stream';
  const buf = fs.readFileSync(abs);
  return `data:${mimeType};base64,${buf.toString('base64')}`;
}
