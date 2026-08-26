import { Router } from 'express';
import authRouter from './auth.routes';
import productsRouter from './products.routes';
import categoriesRouter from './categories.routes';
import testimonialsRouter from './testimonials.routes';
import servicesRouter from './services.routes';
import settingsRouter from './settings.routes';
import contactRouter from './contact.routes';
import inquiryRouter from './inquiry.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/testimonials', testimonialsRouter);
apiRouter.use('/services', servicesRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/inquiry', inquiryRouter);
