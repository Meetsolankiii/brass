import { Router } from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage,
} from '../controllers/products.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { upload, setUploadSubfolder } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', getProducts);
router.get('/:slug', getProduct);

// Admin protected
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

router.post(
  '/:id/images',
  authenticate, requireAdmin,
  setUploadSubfolder('products'),
  upload.array('images', 10),
  uploadProductImages
);

router.delete('/:id/images/:imageId', authenticate, requireAdmin, deleteProductImage);

export default router;
