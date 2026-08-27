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

async function sendContactEmail(toEmail: string, mailOptions: any): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (resendApiKey) {
    console.log(`📡 Sending Contact form email via Resend API to ${toEmail}...`);
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
    from: `"Chetan Brass Contact Form" <${emailFrom.includes('@') ? emailFrom : 'testingfordemo2647@gmail.com'}>`,
  };
  await transporter.sendMail(nodemailerOptions);
}

export async function submitContactForm(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      errorResponse(res, 'Name, email, subject, and message are required fields', 400);
      return;
    }

    // Forward to Formspree asynchronously in the background
    (globalThis as any).fetch('https://formspree.io/f/mdeonypl', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `New Customer Inquiry: ${subject}`,
        name,
        email,
        phone: phone || 'Not provided',
        company: company || 'Not provided',
        subject,
        message,
      }),
    })
      .then((response: any) => {
        if (response.ok) {
          console.log('✉️ Formspree contact form email sent successfully');
        } else {
          console.error('❌ Formspree failed to send contact form email');
        }
      })
      .catch((err: any) => console.error('❌ Failed to forward to Formspree:', err));

    successResponse(res, null, 'Message sent successfully');
  } catch (error) {
    console.error('Contact form submission error:', error);
    errorResponse(res, 'Failed to send message. Please try again later.', 500);
  }
}
