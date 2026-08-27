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

    // Retrieve owner email dynamically from the database
    const owner = await prisma.adminUser.findFirst({
      where: { role: 'owner', isActive: true },
    });
    let toEmail = owner?.email;
    if (!toEmail || toEmail === 'owner@example.com') {
      toEmail = 'solankimeetu26407@gmail.com';
    }

    const mailOptions = {
      from: '"Chetan Brass RFQ Portal" <testingfordemo2647@gmail.com>',
      to: toEmail,
      subject: `New RFQ Inquiry: ${productName}`,
      text: `
        You have received a new Request for Quote (RFQ) submission on Chetan Brass Industries website.

        Customer Details:
        - Name: ${name}
        - Company: ${company || 'Not provided'}
        - Email: ${email}
        - Phone / WhatsApp: ${phone}
        
        RFQ Details:
        - Product Inquired: ${productName}
        - Estimated Quantity: ${quantity || 'Not specified'}
        
        Requirements & Specifications:
        ${requirements}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; color: #1e293b;">
          <h2 style="color: #c2410c; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">New Request for Quote (RFQ)</h2>
          <p style="font-size: 15px; color: #64748b;">A customer has submitted a detailed product inquiry via the Inquiry page. Here are the specifications:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #fff7ed;">
              <td style="padding: 10px; font-weight: bold; width: 35%; border-bottom: 1px solid #e2e8f0; color: #c2410c;">Product Selected</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Estimated Quantity</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${quantity || '<em>Not specified</em>'}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Customer Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Company Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${company || '<em>Not provided</em>'}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email Address</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #1a6ea8; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Phone / WhatsApp</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><a href="tel:${phone}" style="color: #1a6ea8; text-decoration: none;">${phone}</a></td>
            </tr>
          </table>

          <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; border-left: 4px solid #c2410c;">
            <strong style="display: block; margin-bottom: 6px; color: #9a3412;">Specification Details & Requirements:</strong>
            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; font-size: 14px; color: #334155;">${requirements}</p>
          </div>
          
          <p style="font-size: 11px; color: #94a3b8; margin-top: 25px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            This email was sent automatically from the Chetan Brass Industries web server.
          </p>
        </div>
      `,
    };

    sendInquiryEmail(toEmail, mailOptions)
      .then(() => console.log('✉️ Inquiry email sent successfully'))
      .catch((err) => console.error('❌ Failed to send inquiry email:', err));

    successResponse(res, null, 'Inquiry sent successfully');
  } catch (error) {
    console.error('Inquiry form submission error:', error);
    errorResponse(res, 'Failed to send inquiry. Please try again later.', 500);
  }
}
