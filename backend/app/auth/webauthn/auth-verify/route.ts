import { NextRequest, NextResponse } from 'next/server';
import { WebAuthnService } from '@/lib/webauthn';
import { webAuthnConfig } from '@/lib/webauthn';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const authenticationResponse = await request.json();
    const { email } = authenticationResponse;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get the stored challenge
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const challengeEntry = await prisma.cacheEntry.findUnique({
      where: { key: `webauthn-auth-challenge-${email}` },
    });

    if (!challengeEntry) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'No challenge found' }, { status: 400 });
    }

    const { challenge, userId } = JSON.parse(challengeEntry.value);

    // Get user's authenticator devices
    const devices = await WebAuthnService.getUserAuthenticators(userId);
    
    if (devices.length === 0) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'No biometric devices found' }, { status: 400 });
    }

    // Find the authenticator that matches the credential ID
    const authenticator = devices.find(device =>
      device.credentialID.equals(Buffer.from(authenticationResponse.id, 'base64url'))
    );

    if (!authenticator) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Authenticator not found' }, { status: 400 });
    }

    // Verify the authentication response
    const verification = await WebAuthnService.verifyAuthentication(
      authenticationResponse,
      challenge,
      webAuthnConfig.origin,
      webAuthnConfig.rpID,
      authenticator
    );

    if (!verification.verified) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Authentication verification failed' }, { status: 400 });
    }

    // Update the authenticator counter
    await WebAuthnService.updateAuthenticatorCounter(
      authenticator.credentialID,
      verification.authenticationInfo.newCounter
    );

    // Clean up the challenge
    await prisma.cacheEntry.delete({
      where: { key: `webauthn-auth-challenge-${email}` },
    });

    // Update user's last login
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
        lastActivity: new Date(),
      },
    });

    await prisma.$disconnect();

    // Log the successful biometric login
    await AuditLogger.logFromRequest(request, 'BIOMETRIC_LOGIN', 'auth', {
      email,
      deviceId: authenticationResponse.id,
    });

    return NextResponse.json({ 
      verified: true,
      userId,
      message: 'Biometric authentication successful'
    });

  } catch (error) {
    console.error('Error verifying WebAuthn authentication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}