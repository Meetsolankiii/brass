import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { prisma } from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';

// Re-use same transporter settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'testingfordemo2647@gmail.com',
    pass: 'nxmgkltnxocqfczz',
  },
});

async function sendInquiryEmail(toEmail: string, mailOptions: any): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (resendApiKey) {
    console.log(`📡 Sending Inquiry email via Resend API to ${toEmail}...`);
    const response = await (globalThis as any).fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: toEmail,
        subject: mailOptions.subject,
        html: mailOptions.html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API failed: ${response.statusText} - ${errText}`);
    }
    return;
  }

  // Fallback to Nodemailer SMTP
  const nodemailerOptions = {
    ...mailOptions,
    from: `"Chetan Brass RFQ Portal" <${emailFrom.includes('@') ? emailFrom : 'testingfordemo2647@gmail.com'}>`,
  };
  await transporter.sendMail(nodemailerOptions);
}

export async function submitInquiryForm(req: Request, res: Response): Promise<void> {
  try {
    const { name, company, email, phone, productId, quantity, requirements } = req.body;

    if (!name || !email || !phone || !productId || !requirements) {
      errorResponse(res, 'Name, email, phone, product, and requirements are required fields', 400);
      return;
    }

    // Resolve product name from database
    let productName = 'General inquiry / Choose a Product';
    if (productId && productId !== 'general') {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (product) {
        productName = `${product.name} (SKU: ${product.sku || 'N/A'})`;
      } else {
        // Fallback check if it was sent as a slug
        const productBySlug = await prisma.product.findUnique({
          where: { slug: productId },
        });
        if (productBySlug) {
          productName = `${productBySlug.name} (SKU: ${productBySlug.sku || 'N/A'})`;
        }
      }
    }

    // Forward to Formspree asynchronously in the background
    (globalThis as any).fetch('https://formspree.io/f/mdeonypl', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New RFQ Inquiry: ${productName}`,
        name,
        company: company || 'Not provided',
        email,
        phone,
        product: productName,
        quantity: quantity || 'Not specified',
        requirements,
      }),
    })
      .then((response: any) => {
        if (response.ok) {
          console.log('✉️ Formspree RFQ inquiry email sent successfully');
        } else {
          console.error('❌ Formspree failed to send RFQ inquiry email');
        }
      })
      .catch((err: any) => console.error('❌ Failed to forward to Formspree:', err));

    successResponse(res, null, 'Inquiry sent successfully');
  } catch (error) {
    console.error('Inquiry form submission error:', error);
    errorResponse(res, 'Failed to send inquiry. Please try again later.', 500);
  }
}
