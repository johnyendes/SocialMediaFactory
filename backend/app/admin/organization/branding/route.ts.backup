import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get default organization or first organization
    const organization = await prisma.organization.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.$disconnect();

    if (!organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Parse settings
    const settings = organization.settings ? JSON.parse(organization.settings) : {};
    const theme = organization.theme ? JSON.parse(organization.theme) : {};

    const branding = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      domain: organization.domain,
      logo: organization.logo,
      theme: {
        primaryColor: theme.primaryColor || '#3b82f6',
        secondaryColor: theme.secondaryColor || '#1e40af',
        fontFamily: theme.fontFamily || 'system-ui, -apple-system, sans-serif',
        borderRadius: theme.borderRadius || '8px',
        ...theme
      },
      settings: {
        welcomeMessage: settings.welcomeMessage || `Welcome to ${organization.name}`,
        loginButtonText: settings.loginButtonText || 'Sign In',
        showSocialLogin: settings.showSocialLogin !== false,
        showSSO: settings.showSSO || false,
        showMagicLink: settings.showMagicLink !== false,
        showBiometric: settings.showBiometric !== false,
        footerText: settings.footerText || `© 2024 ${organization.name}. All rights reserved.`,
        supportEmail: settings.supportEmail || 'support@example.com',
        ...settings
      }
    };

    return NextResponse.json(branding);

  } catch (error) {
    console.error('Error fetching organization branding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const brandingData = await request.json();
    const { id, name, logo, theme, settings } = brandingData;

    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name: name || undefined,
        logo: logo || undefined,
        theme: theme ? JSON.stringify(theme) : undefined,
        settings: settings ? JSON.stringify(settings) : undefined,
        updatedAt: new Date()
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({ 
      message: 'Organization branding updated successfully',
      organization: updatedOrganization
    });

  } catch (error) {
    console.error('Error updating organization branding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}