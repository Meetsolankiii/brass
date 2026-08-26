import { Request } from 'express';

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  uploadSubfolder?: string;
}
