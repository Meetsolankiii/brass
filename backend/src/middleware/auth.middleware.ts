import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest } from '../types';
import { errorResponse } from '../utils/response';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    errorResponse(res, 'Authorization token required', 401);
    return;
  }
  const token = authHeader.substring(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    errorResponse(res, 'Invalid or expired token', 401);
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) { errorResponse(res, 'Authentication required', 401); return; }
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    errorResponse(res, 'Access denied: Admin or Owner role required', 403);
    return;
  }
  next();
}
