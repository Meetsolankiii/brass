import { Router } from 'express';
import { getSettings, updateSettings, getSettingsByGroup, uploadLogo } from '../controllers/settings.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { upload, setUploadSubfolder } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getSettings);
router.get('/:group', getSettingsByGroup);
router.put('/', authenticate, requireAdmin, updateSettings);
router.post('/logo', authenticate, requireAdmin, setUploadSubfolder('logo'), upload.single('logo'), uploadLogo);

export default router;
