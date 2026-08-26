import { Response } from 'express';

export function successResponse(
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200
): Response {
  return res.status(statusCode).json({ success: true, message, data });
}

export function errorResponse(
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors?: unknown
): Response {
  return res.status(statusCode).json({ success: false, message, errors });
}

export function paginatedResponse(
  res: Response,
  data: unknown,
  total: number,
  page: number,
  limit: number,
  message = 'Success'
): Response {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}
