import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await resend.emails.send({
      from: options.from || process.env.RESEND_FROM_EMAIL || 'noreply@yourapp.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    
    // In development, we still want to continue even if email fails
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Failed to send email');
    }
  }
}

export async function sendMagicLink(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/auth/magic-link/verify?token=${token}`;

  // Log the link for development/debugging
  console.log(`Magic link for ${email}: ${magicLinkUrl}`);

  await sendEmail({
    to: email,
    subject: 'Sign in to Market Intelligence',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Sign in to Market Intelligence</h2>
        <p>Click the link below to sign in to your account:</p>
        <a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Sign In with Magic Link
        </a>
        <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this link, you can safely ignore this email.</p>
      </div>
    `,
  });
}