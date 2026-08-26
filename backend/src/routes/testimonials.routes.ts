import { Router } from 'express';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, uploadTestimonialAvatar } from '../controllers/testimonials.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { upload, setUploadSubfolder } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getTestimonials);
router.post('/', authenticate, requireAdmin, createTestimonial);
router.put('/:id', authenticate, requireAdmin, updateTestimonial);
router.delete('/:id', authenticate, requireAdmin, deleteTestimonial);
router.post('/:id/avatar', authenticate, requireAdmin, setUploadSubfolder('avatars'), upload.single('avatar'), uploadTestimonialAvatar);

export default router;
