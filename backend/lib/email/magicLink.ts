import nodemailer from 'nodemailer';

// Configure email transporter (using Gmail as example, but you can use any service)
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or 'sendgrid', 'aws-ses', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface MagicLinkEmailOptions {
  email: string;
  token: string;
  expiresAt: Date;
}

export const sendMagicLinkEmail = async ({ email, token, expiresAt }: MagicLinkEmailOptions): Promise<boolean> => {
  try {
    const link = `${process.env.NEXTAUTH_URL}/auth/magic-link/verify?token=${token}`;
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Market Intelligence'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Magic Link for Secure Sign In',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin-bottom: 10px;">Secure Sign In</h1>
            <p style="color: #6b7280;">Click the link below to sign in to your account</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <a href="${link}" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Sign In to Your Account
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Important:</strong> This link expires in 15 minutes at ${expiresAt.toLocaleTimeString()}. 
              If you didn't request this link, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is an automated message from ${process.env.COMPANY_NAME || 'Market Intelligence'}.
              <br>
              Having trouble? Copy and paste this link into your browser:
            </p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 11px; color: #374151; margin: 10px 0;">
              ${link}
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    return false;
  }
};

// Generate secure random token
export const generateSecureToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Alternative email service using Resend API
export const sendMagicLinkEmailResend = async ({ email, token }: { email: string; token: string }): Promise<boolean> => {
  try {
    const link = `${process.env.NEXTAUTH_URL}/auth/magic-link/verify?token=${token}`;
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `onboarding@${process.env.RESEND_DOMAIN}`,
        to: [email],
        subject: 'Your Magic Link for Secure Sign In',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin-bottom: 10px;">Secure Sign In</h1>
              <p style="color: #6b7280;">Click the button below to sign in to your account</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" 
                 style="background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Sign In Now
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This link expires in 15 minutes. If you didn't request this, please ignore.
              </p>
            </div>
          </div>
        `,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send magic link via Resend:', error);
    return false;
  }
};