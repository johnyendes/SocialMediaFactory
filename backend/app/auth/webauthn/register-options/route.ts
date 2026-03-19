import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WebAuthnService } from '@/lib/webauthn';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate registration options
    const options = WebAuthnService.generateRegistrationOptions({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
    });

    // Store the challenge in session/temporary storage for verification
    // In a real app, you'd store this in a temporary database or Redis
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Store challenge temporarily (in a real app, use Redis with expiration)
    await prisma.cacheEntry.upsert({
      where: { key: `webauthn-challenge-${session.user.id}` },
      update: {
        value: JSON.stringify({ challenge: options.challenge }),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
      create: {
        key: `webauthn-challenge-${session.user.id}`,
        value: JSON.stringify({ challenge: options.challenge }),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    await prisma.$disconnect();

    return NextResponse.json(options);

  } catch (error) {
    console.error('Error generating WebAuthn registration options:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}