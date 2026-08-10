import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveFile(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<string> {
  await ensureUploadDir();
  const ext = path.extname(originalFilename) || '.pdf';
  const filename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filePath, fileBuffer);
  return `/uploads/${filename}`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl.startsWith('/uploads/')) return;
  const filename = path.basename(fileUrl);
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(`Could not delete local file ${filePath}:`, error);
  }
}
