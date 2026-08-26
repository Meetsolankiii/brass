import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { AuthRequest } from '../types';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';

function genSlug(name: string) { return slugify(name, { lower: true, strict: true, trim: true }); }
function rmFile(url: string) {
  const p = path.join(process.cwd(), 'uploads', url.replace('/api/uploads/', ''));
  if (fs.existsSync(p)) try { fs.unlinkSync(p); } catch { /* ignore */ }
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '12', search = '', category = '', status = '', featured = '', sort = 'createdAt', order = 'desc' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { shortDesc: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }];
    if (category) { const cat = await prisma.category.findFirst({ where: { OR: [{ slug: category }, { id: category }] } }); if (cat) where.categoryId = cat.id; }
    if (status) where.status = status.toUpperCase();
    else if (!req.headers.authorization) where.status = 'ACTIVE';
    if (featured === 'true') where.featured = true;

    const validSort = ['name', 'createdAt', 'updatedAt', 'price'];
    const sortField = validSort.includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: limitNum,
        orderBy: { [sortField]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1, select: { id: true, url: true, altText: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
    paginatedResponse(res, products, total, pageNum, limitNum);
  } catch (error) {
    console.error('Get products error:', error);
    errorResponse(res, 'Failed to fetch products', 500);
  }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        features: { orderBy: { order: 'asc' } },
        specs: { orderBy: { order: 'asc' } },
      },
    });
    if (!product) { errorResponse(res, 'Product not found', 404); return; }
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, status: 'ACTIVE' },
      take: 4,
      include: { images: { where: { isPrimary: true }, take: 1 }, category: { select: { name: true, slug: true } } },
    });
    successResponse(res, { ...product, related });
  } catch (error) {
    console.error('Get product error:', error);
    errorResponse(res, 'Failed to fetch product', 500);
  }
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, categoryId, shortDesc, fullDesc, price, sku, status = 'DRAFT', featured = false, stock, metaTitle, metaDesc, features = [], specs = [] } = req.body;
    if (!name || !categoryId) { errorResponse(res, 'Name and category are required', 400); return; }
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) { errorResponse(res, 'Category not found', 404); return; }

    let slug = genSlug(name); let slugCount = 0;
    while (await prisma.product.findUnique({ where: { slug } })) { slugCount++; slug = `${genSlug(name)}-${slugCount}`; }

    const product = await prisma.product.create({
      data: {
        name, slug, categoryId,
        shortDesc: shortDesc || null, fullDesc: fullDesc || null,
        price: price ? parseFloat(price) : null, sku: sku || null,
        status: (status as string).toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'DRAFT',
        featured: Boolean(featured), stock: stock ? parseInt(stock) : null,
        metaTitle: metaTitle || null, metaDesc: metaDesc || null,
        features: { create: (Array.isArray(features) ? features : []).map((f: string, i: number) => ({ feature: f, order: i })) },
        specs: { create: (Array.isArray(specs) ? specs : []).map((s: { label: string; value: string }, i: number) => ({ label: s.label, value: s.value, order: i })) },
      },
      include: { category: true, features: true, specs: true, images: true },
    });
    successResponse(res, product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    errorResponse(res, 'Failed to create product', 500);
  }
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) { errorResponse(res, 'Product not found', 404); return; }
    const { name, categoryId, shortDesc, fullDesc, price, sku, status, featured, stock, metaTitle, metaDesc, features, specs } = req.body;

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = genSlug(name); let c = 0;
      while (await prisma.product.findFirst({ where: { slug, id: { not: id } } })) { c++; slug = `${genSlug(name)}-${c}`; }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (name !== undefined) { data.name = name; data.slug = slug; }
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (shortDesc !== undefined) data.shortDesc = shortDesc;
    if (fullDesc !== undefined) data.fullDesc = fullDesc;
    if (price !== undefined) data.price = price ? parseFloat(price) : null;
    if (sku !== undefined) data.sku = sku;
    if (status !== undefined) data.status = (status as string).toUpperCase();
    if (featured !== undefined) data.featured = Boolean(featured);
    if (stock !== undefined) data.stock = stock ? parseInt(stock) : null;
    if (metaTitle !== undefined) data.metaTitle = metaTitle;
    if (metaDesc !== undefined) data.metaDesc = metaDesc;
    if (features !== undefined) data.features = { deleteMany: {}, create: (Array.isArray(features) ? features : []).map((f: string, i: number) => ({ feature: f, order: i })) };
    if (specs !== undefined) data.specs = { deleteMany: {}, create: (Array.isArray(specs) ? specs : []).map((s: { label: string; value: string }, i: number) => ({ label: s.label, value: s.value, order: i })) };

    const product = await prisma.product.update({ where: { id }, data, include: { category: true, features: { orderBy: { order: 'asc' } }, specs: { orderBy: { order: 'asc' } }, images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] } } });
    successResponse(res, product, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    errorResponse(res, 'Failed to update product', 500);
  }
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!product) { errorResponse(res, 'Product not found', 404); return; }
    product.images.forEach((img) => rmFile(img.url));
    await prisma.product.delete({ where: { id } });
    successResponse(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    errorResponse(res, 'Failed to delete product', 500);
  }
}

export async function uploadProductImages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    if (!files?.length) { errorResponse(res, 'No images provided', 400); return; }
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) { errorResponse(res, 'Product not found', 404); return; }
    const existingPrimary = await prisma.productImage.findFirst({ where: { productId: id, isPrimary: true } });
    const images = await prisma.$transaction(
      files.map((file, i) => prisma.productImage.create({ data: { productId: id, url: `/api/uploads/products/${file.filename}`, altText: product.name, isPrimary: !existingPrimary && i === 0, order: i } }))
    );
    successResponse(res, images, 'Images uploaded successfully', 201);
  } catch (error) {
    console.error('Upload images error:', error);
    errorResponse(res, 'Failed to upload images', 500);
  }
}

export async function deleteProductImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id, imageId } = req.params;
    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
    if (!image) { errorResponse(res, 'Image not found', 404); return; }
    rmFile(image.url);
    await prisma.productImage.delete({ where: { id: imageId } });
    if (image.isPrimary) {
      const next = await prisma.productImage.findFirst({ where: { productId: id }, orderBy: { order: 'asc' } });
      if (next) await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
    successResponse(res, null, 'Image deleted successfully');
  } catch (error) {
    console.error('Delete image error:', error);
    errorResponse(res, 'Failed to delete image', 500);
  }
}
