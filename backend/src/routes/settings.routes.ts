import { Router } from 'express';
import { getSettings, updateSettings, getSettingsByGroup } from '../controllers/settings.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getSettings);
router.get('/:group', getSettingsByGroup);
router.put('/', authenticate, requireAdmin, updateSettings);

export default router;
