import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../types';

export async function getServices(req: Request, res: Response): Promise<void> {
  try {
    const services = await prisma.service.findMany({ where: req.headers.authorization ? {} : { isActive: true }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
    successResponse(res, services);
  } catch { errorResponse(res, 'Failed to fetch services', 500); }
}

export async function createService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, icon, order = 0, isActive = true } = req.body;
    if (!title || !description) { errorResponse(res, 'Title and description are required', 400); return; }
    successResponse(res, await prisma.service.create({ data: { title, description, icon: icon || null, order: parseInt(order), isActive: Boolean(isActive) } }), 'Service created', 201);
  } catch { errorResponse(res, 'Failed to create service', 500); }
}

export async function updateService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!await prisma.service.findUnique({ where: { id } })) { errorResponse(res, 'Not found', 404); return; }
    const { title, description, icon, order, isActive } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (title !== undefined) data.title = title; if (description !== undefined) data.description = description;
    if (icon !== undefined) data.icon = icon; if (order !== undefined) data.order = parseInt(order);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    successResponse(res, await prisma.service.update({ where: { id }, data }), 'Updated');
  } catch { errorResponse(res, 'Failed to update', 500); }
}

export async function deleteService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!await prisma.service.findUnique({ where: { id } })) { errorResponse(res, 'Not found', 404); return; }
    await prisma.service.delete({ where: { id } });
    successResponse(res, null, 'Deleted');
  } catch { errorResponse(res, 'Failed to delete', 500); }
}
