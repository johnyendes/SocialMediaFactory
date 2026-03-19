import crypto from 'crypto';
import { AuditLogger } from './audit-logger';

export interface MagicLinkData {
  email: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export class MagicLinkService {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly EXPIRY_MINUTES = 15; // 15 minutes

  // Generate a secure magic link token
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  // Create a magic link for email authentication
  static async createMagicLink(email: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + this.EXPIRY_MINUTES * 60 * 1000);

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Store magic link in database
      await prisma.magicLink.create({
        data: {
          email,
          token,
          expiresAt,
          ipAddress,
          userAgent,
          isUsed: false,
        },
      });

      await prisma.$disconnect();
    } catch (error) {
      await prisma.$disconnect();
      throw error;
    }

    return token;
  }

  // Verify a magic link token
  static async verifyMagicLink(token: string, ipAddress?: string): Promise<{ valid: boolean; email?: string }> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const magicLink = await prisma.magicLink.findUnique({
        where: { token },
      });

      if (!magicLink) {
        await prisma.$disconnect();
        return { valid: false };
      }

      // Check if token is expired
      if (magicLink.expiresAt < new Date()) {
        await prisma.$disconnect();
        return { valid: false };
      }

      // Check if token is already used
      if (magicLink.isUsed) {
        await prisma.$disconnect();
        return { valid: false };
      }

      // Mark token as used
      await prisma.magicLink.update({
        where: { id: magicLink.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
          usedIpAddress: ipAddress,
        },
      });

      await prisma.$disconnect();

      return { 
        valid: true, 
        email: magicLink.email 
      };
    } catch (error) {
      await prisma.$disconnect();
      throw error;
    }
  }

  // Send magic link email
  static async sendMagicLink(email: string, token: string): Promise<void> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const magicLinkUrl = `${baseUrl}/auth/magic-link/verify?token=${token}`;

    // In a real implementation, you would use an email service like SendGrid, AWS SES, etc.
    // For now, we'll just log the link (in production, replace with actual email sending)
    console.log(`Magic link for ${email}: ${magicLinkUrl}`);

    // TODO: Implement actual email sending
    // Example with SendGrid:
    /*
    import sgMail from '@sendgrid/mail';
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Sign in to Market Intelligence',
      html: `
        <div>
          <h2>Sign in to Market Intelligence</h2>
          <p>Click the link below to sign in to your account:</p>
          <a href="${magicLinkUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Sign In
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            This link will expire in 15 minutes. If you didn't request this link, you can safely ignore this email.
          </p>
        </div>
      `,
    };
    
    await sgMail.send(msg);
    */
  }

  // Clean up expired magic links
  static async cleanupExpiredLinks(): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.magicLink.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      await prisma.$disconnect();
    } catch (error) {
      await prisma.$disconnect();
      console.error('Failed to cleanup expired magic links:', error);
    }
  }

  // Get magic link statistics for admin dashboard
  static async getStatistics(): Promise<{
    totalLinks: number;
    usedLinks: number;
    expiredLinks: number;
    pendingLinks: number;
  }> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const totalLinks = await prisma.magicLink.count();
      const usedLinks = await prisma.magicLink.count({
        where: { isUsed: true },
      });
      const expiredLinks = await prisma.magicLink.count({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      const pendingLinks = await prisma.magicLink.count({
        where: {
          isUsed: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });

      await prisma.$disconnect();

      return {
        totalLinks,
        usedLinks,
        expiredLinks,
        pendingLinks,
      };
    } catch (error) {
      await prisma.$disconnect();
      return {
        totalLinks: 0,
        usedLinks: 0,
        expiredLinks: 0,
        pendingLinks: 0,
      };
    }
  }
}