import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../types';
import path from 'path';
import fs from 'fs';

const rmFile = (url: string) => { const p = path.join(process.cwd(), 'uploads', url.replace('/api/uploads/', '')); if (fs.existsSync(p)) try { fs.unlinkSync(p); } catch { /* */ } };

export async function getTestimonials(req: Request, res: Response): Promise<void> {
  try {
    const testimonials = await prisma.testimonial.findMany({ where: req.headers.authorization ? {} : { isActive: true }, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
    successResponse(res, testimonials);
  } catch { errorResponse(res, 'Failed to fetch testimonials', 500); }
}

export async function createTestimonial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, role, company, rating = 5, content, isActive = true, order = 0 } = req.body;
    if (!name || !content) { errorResponse(res, 'Name and content are required', 400); return; }
    const t = await prisma.testimonial.create({ data: { name, role: role || null, company: company || null, rating: parseInt(rating), content, isActive: Boolean(isActive), order: parseInt(order) } });
    successResponse(res, t, 'Testimonial created', 201);
  } catch { errorResponse(res, 'Failed to create testimonial', 500); }
}

export async function updateTestimonial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!await prisma.testimonial.findUnique({ where: { id } })) { errorResponse(res, 'Not found', 404); return; }
    const { name, role, company, rating, content, isActive, order } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (name !== undefined) data.name = name; if (role !== undefined) data.role = role; if (company !== undefined) data.company = company;
    if (rating !== undefined) data.rating = parseInt(rating); if (content !== undefined) data.content = content;
    if (isActive !== undefined) data.isActive = Boolean(isActive); if (order !== undefined) data.order = parseInt(order);
    successResponse(res, await prisma.testimonial.update({ where: { id }, data }), 'Updated');
  } catch { errorResponse(res, 'Failed to update', 500); }
}

export async function deleteTestimonial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const t = await prisma.testimonial.findUnique({ where: { id } });
    if (!t) { errorResponse(res, 'Not found', 404); return; }
    if (t.avatar) rmFile(t.avatar);
    await prisma.testimonial.delete({ where: { id } });
    successResponse(res, null, 'Deleted');
  } catch { errorResponse(res, 'Failed to delete', 500); }
}

export async function uploadTestimonialAvatar(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params; const file = req.file;
    if (!file) { errorResponse(res, 'No image provided', 400); return; }
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) { errorResponse(res, 'Not found', 404); return; }
    if (existing.avatar) rmFile(existing.avatar);
    successResponse(res, await prisma.testimonial.update({ where: { id }, data: { avatar: `/api/uploads/avatars/${file.filename}` } }), 'Avatar uploaded');
  } catch { errorResponse(res, 'Failed to upload', 500); }
}
