import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../types';

const toMap = (settings: { key: string; value: string }[]) =>
  settings.reduce<Record<string, string>>((acc, s) => { acc[s.key] = s.value; return acc; }, {});

export async function getSettings(_req: Request, res: Response): Promise<void> {
  try {
    successResponse(res, toMap(await prisma.siteSetting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] })));
  } catch { errorResponse(res, 'Failed to fetch settings', 500); }
}

export async function getSettingsByGroup(req: Request, res: Response): Promise<void> {
  try {
    successResponse(res, toMap(await prisma.siteSetting.findMany({ where: { group: req.params.group }, orderBy: { key: 'asc' } })));
  } catch { errorResponse(res, 'Failed to fetch settings', 500); }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const settings = req.body as Record<string, string>;
    if (!settings || typeof settings !== 'object') { errorResponse(res, 'Settings must be a key-value object', 400); return; }
    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) =>
        prisma.siteSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value), group: 'general' } })
      )
    );
    successResponse(res, null, 'Settings updated');
  } catch (error) {
    console.error('Update settings error:', error);
    errorResponse(res, 'Failed to update settings', 500);
  }
}

export async function uploadLogo(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      errorResponse(res, 'No file uploaded', 400);
      return;
    }

    // Automatically crop uploaded logo image on the server using Python PIL
    try {
      const { execSync } = require('child_process');
      const path = require('path');
      const scriptPath = path.join(process.cwd(), 'src', 'utils', 'crop_image.py');
      const filePath = req.file.path;
      console.log(`[Auto-Crop] Running logo cropping on: ${filePath}`);
      execSync(`python "${scriptPath}" "${filePath}"`);
      console.log('[Auto-Crop] Logo cropped successfully');
    } catch (cropError) {
      console.error('[Auto-Crop] Failed to crop logo:', cropError);
    }

    let logoPath = `/api/uploads/logo/${req.file.filename}`;
    try {
      const fs = require('fs');
      const buffer = fs.readFileSync(req.file.path);
      logoPath = `data:${req.file.mimetype || 'image/png'};base64,${buffer.toString('base64')}`;
    } catch (e) {
      console.error('Error reading logo buffer for base64:', e);
    }
    
    // Update database
    await prisma.siteSetting.upsert({
      where: { key: 'site_logo' },
      update: { value: logoPath },
      create: { key: 'site_logo', value: logoPath, group: 'general' }
    });
    
    successResponse(res, { site_logo: logoPath }, 'Logo uploaded successfully');
  } catch (error) {
    console.error('Upload logo error:', error);
    errorResponse(res, 'Failed to upload logo', 500);
  }
}


export async function recordVisit(_req: Request, res: Response): Promise<void> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'visitor_count' } });
    const currentCount = setting ? parseInt(setting.value, 10) || 0 : 0;
    const newCount = currentCount + 1;
    await prisma.siteSetting.upsert({
      where: { key: 'visitor_count' },
      update: { value: String(newCount) },
      create: { key: 'visitor_count', value: String(newCount), group: 'analytics', label: 'Total Website Visitors' },
    });
    successResponse(res, { count: newCount });
  } catch (error) {
    console.error('Record visit error:', error);
    errorResponse(res, 'Failed to record visit', 500);
  }
}

export async function getVisitStats(_req: Request, res: Response): Promise<void> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'visitor_count' } });
    const count = setting ? parseInt(setting.value, 10) || 0 : 0;
    successResponse(res, { count });
  } catch (error) {
    errorResponse(res, 'Failed to get visit stats', 500);
  }
}

export async function resetVisitCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const newCount = typeof req.body?.count === 'number' ? req.body.count : 0;
    await prisma.siteSetting.upsert({
      where: { key: 'visitor_count' },
      update: { value: String(newCount) },
      create: { key: 'visitor_count', value: String(newCount), group: 'analytics', label: 'Total Website Visitors' },
    });
    successResponse(res, { count: newCount }, 'Visitor counter reset successfully');
  } catch (error) {
    console.error('Reset visit count error:', error);
    errorResponse(res, 'Failed to reset visit count', 500);
  }
}
