import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireAdmin } from '@/lib/auth-middleware';
import { GDPRComplianceService } from '@/lib/gdpr-compliance';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticate(request);
    
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const adminCheck = requireAdmin(auth.user);
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    console.log('✅ AUTH: GDPR exports accessed by admin:', auth.user.email);

    // Get real GDPR data requests from database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const gdprRequests = await prisma.gDPRDataRequest.findMany({
        orderBy: { requestDate: 'desc' },
        take: 50 // Get latest 50 requests
      });

      const exports = gdprRequests.map(request => ({
        id: request.id,
        userId: request.userId,
        type: request.type,
        status: request.status,
        requestDate: request.requestDate.toISOString(),
        completedDate: request.status === 'completed' ? request.requestDate.toISOString() : null,
        downloadUrl: request.status === 'completed' ? `/api/admin/compliance/download/${request.id}` : null,
        estimatedCompletion: request.status === 'pending' ? '2-3 minutes' : null
      }));

      return NextResponse.json({
        status: 'ready',
        totalRequests: gdprRequests.length,
        pendingRequests: gdprRequests.filter(r => r.status === 'pending').length,
        completedRequests: gdprRequests.filter(r => r.status === 'completed').length,
        exports,
        authenticated: true,
        user: session.user.email,
        timestamp: new Date().toISOString()
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error in GDPR export:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);
    
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const adminCheck = requireAdmin(auth.user);
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    console.log('✅ AUTH: GDPR export initiated by admin:', auth.user.email, 'for user:', body.userId);

    if (!body.userId || !body.type) {
      return NextResponse.json({ error: 'userId and type are required' }, { status: 400 });
    }

    // Create real GDPR data request in database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const gdprRequest = await prisma.gDPRDataRequest.create({
        data: {
          userId: body.userId,
          type: body.type,
          status: 'pending',
          requestDate: new Date()
        }
      });

      // TODO: Start actual data processing in background
      // For now, we'll simulate completion after 2 minutes
      setTimeout(async () => {
        try {
          const bgPrisma = new PrismaClient();
          await bgPrisma.gDPRDataRequest.update({
            where: { id: gdprRequest.id },
            data: { status: 'completed' }
          });
          await bgPrisma.$disconnect();
        } catch (error) {
          console.error('Error updating GDPR request status:', error);
        }
      }, 120000); // 2 minutes

      return NextResponse.json({
        status: 'initiated',
        exportId: gdprRequest.id,
        userId: body.userId,
        type: body.type,
        estimatedCompletion: '2-3 minutes',
        authenticated: true,
        user: session.user.email,
        timestamp: new Date().toISOString()
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error initiating GDPR export:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}