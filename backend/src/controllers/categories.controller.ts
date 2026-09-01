import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../types';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';

const genSlug = (name: string) => slugify(name, { lower: true, strict: true, trim: true });
const rmFile = (url: string) => { const p = path.join(process.cwd(), 'uploads', url.replace('/api/uploads/', '')); if (fs.existsSync(p)) try { fs.unlinkSync(p); } catch { /* */ } };

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const isAdmin = !!req.headers.authorization;
    const categories = await prisma.category.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    successResponse(res, categories);
  } catch { errorResponse(res, 'Failed to fetch categories', 500); }
}

export async function getCategory(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: {
        products: { where: { status: 'ACTIVE' }, include: { images: { where: { isPrimary: true }, take: 1 } }, take: 20 },
        _count: { select: { products: true } },
      },
    });
    if (!category) { errorResponse(res, 'Category not found', 404); return; }
    successResponse(res, category);
  } catch { errorResponse(res, 'Failed to fetch category', 500); }
}

export async function createCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, order = 0, isActive = true } = req.body;
    if (!name) { errorResponse(res, 'Category name is required', 400); return; }
    let slug = genSlug(name); let c = 0;
    while (await prisma.category.findUnique({ where: { slug } })) { c++; slug = `${genSlug(name)}-${c}`; }
    const category = await prisma.category.create({ data: { name, slug, description: description || null, order: parseInt(order), isActive: Boolean(isActive) } });
    successResponse(res, category, 'Category created', 201);
  } catch { errorResponse(res, 'Failed to create category', 500); }
}

export async function updateCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) { errorResponse(res, 'Category not found', 404); return; }
    const { name, description, order, isActive } = req.body;
    let slug = existing.slug;
    if (name && name !== existing.name) { slug = genSlug(name); let c = 0; while (await prisma.category.findFirst({ where: { slug, id: { not: id } } })) { c++; slug = `${genSlug(name)}-${c}`; } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (name !== undefined) { data.name = name; data.slug = slug; }
    if (description !== undefined) data.description = description;
    if (order !== undefined) data.order = parseInt(order);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    const category = await prisma.category.update({ where: { id }, data, include: { _count: { select: { products: true } } } });
    successResponse(res, category, 'Category updated');
  } catch { errorResponse(res, 'Failed to update category', 500); }
}

export async function deleteCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) { errorResponse(res, `Cannot delete: ${productCount} product(s) still use this category.`, 400); return; }
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) { errorResponse(res, 'Category not found', 404); return; }
    if (cat.image) rmFile(cat.image);
    await prisma.category.delete({ where: { id } });
    successResponse(res, null, 'Category deleted');
  } catch { errorResponse(res, 'Failed to delete category', 500); }
}

export async function uploadCategoryImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) { errorResponse(res, 'No image provided', 400); return; }
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) { errorResponse(res, 'Category not found', 404); return; }
    if (existing.image && !existing.image.startsWith('data:')) rmFile(existing.image);

    let imageUrl = `/api/uploads/categories/${file.filename}`;
    try {
      const buffer = fs.readFileSync(file.path);
      imageUrl = `data:${file.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    } catch (e) {
      console.error('Error reading category image buffer:', e);
    }

    const category = await prisma.category.update({ where: { id }, data: { image: imageUrl } });
    successResponse(res, category, 'Image uploaded');
  } catch { errorResponse(res, 'Failed to upload image', 500); }
}
