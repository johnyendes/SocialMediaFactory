import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnService } from '@/lib/webauthn';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's authenticator devices
    const devices = await WebAuthnService.getUserAuthenticators(user.id);

    if (devices.length === 0) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'No biometric devices found' }, { status: 400 });
    }

    // Generate authentication options
    const options = WebAuthnService.generateAuthenticationOptions(devices);

    // Store the challenge for verification
    await prisma.cacheEntry.upsert({
      where: { key: `webauthn-auth-challenge-${email}` },
      update: {
        value: JSON.stringify({ 
          challenge: options.challenge,
          userId: user.id 
        }),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
      create: {
        key: `webauthn-auth-challenge-${email}`,
        value: JSON.stringify({ 
          challenge: options.challenge,
          userId: user.id 
        }),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    await prisma.$disconnect();

    return NextResponse.json(options);

  } catch (error) {
    console.error('Error generating WebAuthn authentication options:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}