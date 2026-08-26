import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export function notFound(req: Request, res: Response): void {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error('Unhandled error:', err.message);
  errorResponse(res, err.message || 'Internal server error', 500);
}
