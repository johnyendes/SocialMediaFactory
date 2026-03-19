import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireAdmin } from '@/lib/auth-middleware';

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

    console.log('✅ AUTH: White label settings accessed by admin:', auth.user.email);

    // Get real organization data from database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const organization = await prisma.organization.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
      });

      if (!organization) {
        return NextResponse.json({ 
          error: 'No organization found',
          message: 'Please create an organization first'
        }, { status: 404 });
      }

      const settings = organization.settings ? JSON.parse(organization.settings) : {};
      const theme = organization.theme ? JSON.parse(organization.theme) : {};

      const branding = {
        id: organization.id,
        organizationName: organization.name,
        slug: organization.slug,
        domain: organization.domain,
        logo: organization.logo,
        primaryColor: theme.primaryColor || '#2563eb',
        secondaryColor: theme.secondaryColor || '#64748b',
        theme: theme.theme || 'professional',
        customCSS: theme.customCSS || null,
        favicon: theme.favicon || '/favicon.ico',
        fontFamily: theme.fontFamily || 'system-ui, -apple-system, sans-serif',
        borderRadius: theme.borderRadius || '8px',
        welcomeMessage: settings.welcomeMessage || `Welcome to ${organization.name}`,
        loginButtonText: settings.loginButtonText || 'Sign In',
        showSocialLogin: settings.showSocialLogin !== false,
        showSSO: settings.showSSO || false,
        showMagicLink: settings.showMagicLink !== false,
        showBiometric: settings.showBiometric !== false,
        footerText: settings.footerText || `© ${new Date().getFullYear()} ${organization.name}. All rights reserved.`,
        supportEmail: settings.supportEmail || 'support@example.com',
        lastUpdated: organization.updatedAt ? organization.updatedAt.toISOString() : organization.createdAt.toISOString()
      };

      return NextResponse.json({
        branding,
        authenticated: true,
        user: auth.user.email,
        timestamp: new Date().toISOString()
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error fetching branding:', error);
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

    const brandingData = await request.json();
    console.log('✅ AUTH: White label settings updated by admin:', auth.user.email);

    if (!brandingData.id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const updatedOrganization = await prisma.organization.update({
        where: { id: brandingData.id },
        data: {
          name: brandingData.organizationName || brandingData.name,
          slug: brandingData.slug,
          domain: brandingData.domain,
          logo: brandingData.logo,
          theme: JSON.stringify({
            primaryColor: brandingData.primaryColor,
            secondaryColor: brandingData.secondaryColor,
            theme: brandingData.theme,
            customCSS: brandingData.customCSS,
            favicon: brandingData.favicon,
            fontFamily: brandingData.fontFamily,
            borderRadius: brandingData.borderRadius
          }),
          settings: JSON.stringify({
            welcomeMessage: brandingData.welcomeMessage,
            loginButtonText: brandingData.loginButtonText,
            showSocialLogin: brandingData.showSocialLogin,
            showSSO: brandingData.showSSO,
            showMagicLink: brandingData.showMagicLink,
            showBiometric: brandingData.showBiometric,
            footerText: brandingData.footerText,
            supportEmail: brandingData.supportEmail
          }),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        status: 'updated',
        organization: updatedOrganization,
        authenticated: true,
        user: auth.user.email,
        timestamp: new Date().toISOString()
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error updating branding:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}