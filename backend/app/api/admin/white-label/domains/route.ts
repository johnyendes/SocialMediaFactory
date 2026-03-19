import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WhiteLabelService } from '@/lib/white-label';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || 'default';

    // Get organization domains
    const domains = await WhiteLabelService.getOrganizationDomains(organizationId);

    return NextResponse.json(domains);

  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { domain, organizationId } = await request.json();

    if (!domain || !organizationId) {
      return NextResponse.json({ error: 'Domain and organization ID are required' }, { status: 400 });
    }

    // Add custom domain
    const result = await WhiteLabelService.addCustomDomain(organizationId, domain);

    if (result.success) {
      return NextResponse.json({ 
        message: 'Domain added successfully',
        verificationToken: result.verificationToken 
      });
    } else {
      return NextResponse.json({ error: 'Failed to add domain' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error adding domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('domainId');
    const organizationId = searchParams.get('organizationId');

    if (!domainId || !organizationId) {
      return NextResponse.json({ error: 'Domain ID and organization ID are required' }, { status: 400 });
    }

    // Remove custom domain
    const success = await WhiteLabelService.removeCustomDomain(domainId, organizationId);

    if (success) {
      return NextResponse.json({ message: 'Domain removed successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to remove domain' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error removing domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}