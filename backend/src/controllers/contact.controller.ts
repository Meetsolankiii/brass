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

    // Retrieve owner email dynamically from the database
    const owner = await prisma.adminUser.findFirst({
      where: { role: 'owner', isActive: true },
    });
    let toEmail = owner?.email;
    if (!toEmail || toEmail === 'owner@example.com') {
      toEmail = 'solankimeetu26407@gmail.com';
    }

    const mailOptions = {
      from: '"Chetan Brass Contact Form" <testingfordemo2647@gmail.com>',
      to: toEmail,
      subject: `New Customer Inquiry: ${subject}`,
      text: `
        You have received a new contact form submission on Chetan Brass Industries website.

        Customer Details:
        - Name: ${name}
        - Email: ${email}
        - Phone: ${phone || 'Not provided'}
        - Company: ${company || 'Not provided'}
        
        Subject: ${subject}
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; color: #1e293b;">
          <h2 style="color: #1a6ea8; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">New Contact Form Submission</h2>
          <p style="font-size: 15px; color: #64748b;">A customer has submitted a message via the website contact form. Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; width: 30%; border-bottom: 1px solid #e2e8f0;">Customer Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email Address</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #1a6ea8; text-decoration: none;">${email}</a></td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Phone Number</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${phone ? `<a href="tel:${phone}" style="color: #1a6ea8; text-decoration: none;">${phone}</a>` : '<em>Not provided</em>'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Company Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${company || '<em>Not provided</em>'}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Subject</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${subject}</td>
            </tr>
          </table>

          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1a6ea8;">
            <strong style="display: block; margin-bottom: 6px;">Customer Message:</strong>
            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; font-size: 14px; color: #334155;">${message}</p>
          </div>
          
          <p style="font-size: 11px; color: #94a3b8; margin-top: 25px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            This email was sent automatically from the Chetan Brass Industries web server.
          </p>
        </div>
      `,
    };

    sendContactEmail(toEmail, mailOptions)
      .then(() => console.log('✉️ Contact form email sent successfully'))
      .catch((err) => console.error('❌ Failed to send contact email:', err));

    successResponse(res, null, 'Message sent successfully');
  } catch (error) {
    console.error('Contact form submission error:', error);
    errorResponse(res, 'Failed to send message. Please try again later.', 500);
  }
}
