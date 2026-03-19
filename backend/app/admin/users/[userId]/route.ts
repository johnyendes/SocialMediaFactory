import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit-logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = params;
    const body = await request.json();
    const { role, isActive } = body;

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (role !== undefined) {
      updateData.role = role;
    }
    
    if (isActive !== undefined) {
      // Instead of updating isActive, we'll track this differently
      // For now, we'll update lastActivity to simulate deactivation
      updateData.lastActivity = isActive ? new Date() : new Date('2000-01-01');
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Log the user modification
    await AuditLogger.logDataModification(
      session.user.id,
      'UPDATE',
      'user',
      userId,
      {
        updatedFields: Object.keys(updateData),
        previousData: {
          role: existingUser.role,
          isActive: existingUser.lastActivity ? 
            new Date(existingUser.lastActivity).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) : 
            false
        },
        newData: {
          role: updatedUser.role,
          isActive
        }
      }
    );

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = params;

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log the user deletion
    await AuditLogger.logDataModification(
      session.user.id,
      'DELETE',
      'user',
      userId,
      {
        deletedUser: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      }
    );

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}