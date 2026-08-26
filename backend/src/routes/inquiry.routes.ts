import { Router } from 'express';
import { submitInquiryForm } from '../controllers/inquiry.controller';
import { validateBody } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional().nullable(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.string().optional().nullable(),
  requirements: z.string().min(10, 'Please provide more details on specifications (at least 10 characters)'),
});

router.post('/', validateBody(inquirySchema), submitInquiryForm);

export default router;
