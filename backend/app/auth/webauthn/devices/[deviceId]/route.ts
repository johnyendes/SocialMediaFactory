import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId } = params;

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Delete the device (must belong to the user)
    const result = await prisma.authenticatorDevice.deleteMany({
      where: {
        id: deviceId,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Check if user has any remaining devices
    const remainingDevices = await prisma.authenticatorDevice.count({
      where: { userId: session.user.id },
    });

    // If no devices remaining, disable biometric authentication
    if (remainingDevices === 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          mfaEnabled: false,
          mfaEnabledAt: null,
        },
      });
    }

    await prisma.$disconnect();

    return NextResponse.json({ message: 'Device removed successfully' });

  } catch (error) {
    console.error('Error removing device:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}