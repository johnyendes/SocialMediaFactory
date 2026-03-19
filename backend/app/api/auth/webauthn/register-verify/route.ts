import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WebAuthnService } from '@/lib/webauthn';
import { webAuthnConfig } from '@/lib/webauthn';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registrationResponse = await request.json();

    // Get the stored challenge
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const challengeEntry = await prisma.cacheEntry.findUnique({
      where: { key: `webauthn-challenge-${session.user.id}` },
    });

    if (!challengeEntry) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'No challenge found' }, { status: 400 });
    }

    const { challenge } = JSON.parse(challengeEntry.value);

    // Verify the registration response
    const verification = await WebAuthnService.verifyRegistration(
      registrationResponse,
      challenge,
      webAuthnConfig.origin,
      webAuthnConfig.rpID
    );

    if (!verification.verified || !verification.registrationInfo) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Registration verification failed' }, { status: 400 });
    }

    // Store the new authenticator device
    await WebAuthnService.storeAuthenticatorDevice(session.user.id, {
      credentialID: verification.registrationInfo.credentialID,
      credentialPublicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.counter,
      transports: registrationResponse.response.transports,
      name: registrationResponse.deviceName || 'Biometric Device',
    });

    // Clean up the challenge
    await prisma.cacheEntry.delete({
      where: { key: `webauthn-challenge-${session.user.id}` },
    });

    // Enable biometric authentication for the user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mfaEnabled: true,
        mfaEnabledAt: new Date(),
      },
    });

    await prisma.$disconnect();

    // Log the successful registration
    await AuditLogger.logSecurityEvent(session.user.id, 'BIOMETRIC_DEVICE_REGISTERED', {
      deviceName: registrationResponse.deviceName || 'Biometric Device',
    });

    return NextResponse.json({ 
      verified: true,
      message: 'Biometric device registered successfully'
    });

  } catch (error) {
    console.error('Error verifying WebAuthn registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}