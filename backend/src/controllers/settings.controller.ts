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
