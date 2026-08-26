import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request & { uploadSubfolder?: string }, _file, cb) => {
    const subfolder = req.uploadSubfolder || 'general';
    const dir = path.join(process.cwd(), 'uploads', subfolder);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  ALLOWED_MIME_TYPES.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE, files: 10 } });

export function setUploadSubfolder(subfolder: string) {
  return (req: Request & { uploadSubfolder?: string }, _res: Response, next: NextFunction) => {
    req.uploadSubfolder = subfolder;
    next();
  };
}

export function deleteUploadedFile(urlPath: string): void {
  const relativePath = urlPath.replace('/api/uploads/', '');
  const fullPath = path.join(process.cwd(), 'uploads', relativePath);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch { /* ignore */ }
  }
}
