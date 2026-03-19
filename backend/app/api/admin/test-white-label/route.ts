import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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
          success: false,
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
        success: true,
        message: '✅ White Label API now uses REAL database data',
        data: {
          branding,
          timestamp: new Date().toISOString()
        }
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error in test white label:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}