import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/magic-link/error?error=invalid_token`);
    }

    // Find the magic link token
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    });

    if (!magicLink) {
      await prisma.$disconnect();
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/magic-link/error?error=invalid_token`);
    }

    // Check if token is expired
    if (magicLink.expiresAt < new Date()) {
      await prisma.$disconnect();
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/magic-link/error?error=expired_token`);
    }

    // Check if token is already used
    if (magicLink.isUsed) {
      await prisma.$disconnect();
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/magic-link/error?error=used_token`);
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: magicLink.email },
    });

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/magic-link/error?error=user_not_found`);
    }

    // Mark token as used
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
        usedIpAddress: request.ip || undefined,
      },
    });

    // Update user's last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        lastActivity: new Date(),
      },
    });

    await prisma.$disconnect();

    // Log the successful magic link login
    await AuditLogger.logFromRequest(request, 'MAGIC_LINK_LOGIN', 'auth', {
      email: magicLink.email,
    });

    // Create a session cookie for the user (simplified implementation)
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/magic-link/success?email=${encodeURIComponent(magicLink.email)}`);
    
    // Set session cookie
    response.cookies.set('session_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Error verifying magic link:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/magic-link/error?error=internal_error`);
  }
}