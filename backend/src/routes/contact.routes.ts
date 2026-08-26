import { Router } from 'express';
import { submitContactForm } from '../controllers/contact.controller';
import { validateBody } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(20, 'Please provide more detail (at least 20 characters)'),
});

router.post('/', validateBody(contactSchema), submitContactForm);

export default router;
