import { Router } from 'express';
import {
  getCategories, getCategory, createCategory, updateCategory, deleteCategory, uploadCategoryImage,
} from '../controllers/categories.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { upload, setUploadSubfolder } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', authenticate, requireAdmin, createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);
router.post('/:id/image', authenticate, requireAdmin, setUploadSubfolder('categories'), upload.single('image'), uploadCategoryImage);

export default router;
