import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/audit-logger';
import { sendMagicLinkEmail, generateSecureToken } from '@/lib/email/magicLink';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user exists
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await prisma.$disconnect();
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        message: 'If an account with this email exists, a magic link has been sent.' 
      });
    }

    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store magic link in database
    await prisma.magicLink.create({
      data: {
        email,
        token,
        expiresAt,
        ipAddress: request.ip || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    await prisma.$disconnect();

    // Send magic link email
    const emailSent = await sendMagicLinkEmail({ 
      email, 
      token, 
      expiresAt 
    });

    if (!emailSent) {
      return NextResponse.json({ 
        error: 'Failed to send magic link email' 
      }, { status: 500 });
    }

    // Log the magic link request
    await AuditLogger.logFromRequest(request, 'MAGIC_LINK_REQUESTED', 'auth', {
      email,
    });

    return NextResponse.json({ 
      message: 'If an account with this email exists, a magic link has been sent.' 
    });

  } catch (error) {
    console.error('Error requesting magic link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}