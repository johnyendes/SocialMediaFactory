import { Organization } from '@prisma/client';

export interface BrandConfig {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  favicon?: string;
  customCSS?: string;
  companyName?: string;
  supportEmail?: string;
  footerText?: string;
}

export interface CustomDomain {
  id: string;
  organizationId: string;
  domain: string;
  isVerified: boolean;
  verificationToken?: string;
  sslEnabled: boolean;
  createdAt: Date;
}

export class WhiteLabelService {
  // Get organization branding configuration
  static async getOrganizationBranding(organizationId: string): Promise<BrandConfig | null> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          logo: true,
          settings: true,
        },
      });

      if (!organization) {
        return null;
      }

      const settings = JSON.parse(organization.settings || '{}');
      
      return {
        logo: organization.logo || undefined,
        primaryColor: settings.primaryColor || '#3b82f6',
        secondaryColor: settings.secondaryColor || '#1e40af',
        fontFamily: settings.fontFamily || 'system-ui, -apple-system, sans-serif',
        favicon: settings.favicon || undefined,
        customCSS: settings.customCSS || undefined,
        companyName: settings.companyName || organization.name,
        supportEmail: settings.supportEmail || 'support@example.com',
        footerText: settings.footerText || `© 2024 ${organization.name}. All rights reserved.`,
      };
    } catch (error) {
      console.error('Error fetching organization branding:', error);
      return null;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Update organization branding
  static async updateOrganizationBranding(organizationId: string, config: BrandConfig): Promise<boolean> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return false;
      }

      const currentSettings = JSON.parse(organization.settings || '{}');
      const updatedSettings = {
        ...currentSettings,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        fontFamily: config.fontFamily,
        favicon: config.favicon,
        customCSS: config.customCSS,
        companyName: config.companyName,
        supportEmail: config.supportEmail,
        footerText: config.footerText,
      };

      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          logo: config.logo,
          settings: JSON.stringify(updatedSettings),
        },
      });

      await prisma.$disconnect();
      return true;
    } catch (error) {
      console.error('Error updating organization branding:', error);
      await prisma.$disconnect();
      return false;
    }
  }

  // Get branding by custom domain
  static async getBrandingByDomain(domain: string): Promise<BrandConfig | null> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const customDomain = await prisma.customDomain.findUnique({
        where: { domain },
        include: {
          organization: true,
        },
      });

      if (!customDomain || !customDomain.isVerified) {
        return null;
      }

      return await this.getOrganizationBranding(customDomain.organizationId);
    } catch (error) {
      console.error('Error fetching branding by domain:', error);
      return null;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Add custom domain for organization
  static async addCustomDomain(
    organizationId: string,
    domain: string
  ): Promise<{ success: boolean; verificationToken?: string }> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Generate verification token
      const verificationToken = this.generateVerificationToken();

      await prisma.customDomain.create({
        data: {
          organizationId,
          domain,
          verificationToken,
          isVerified: false,
          sslEnabled: false,
        },
      });

      await prisma.$disconnect();
      
      return { 
        success: true, 
        verificationToken 
      };
    } catch (error) {
      console.error('Error adding custom domain:', error);
      await prisma.$disconnect();
      return { success: false };
    }
  }

  // Verify custom domain ownership
  static async verifyCustomDomain(domain: string, token: string): Promise<boolean> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const customDomain = await prisma.customDomain.findUnique({
        where: { domain },
      });

      if (!customDomain || customDomain.verificationToken !== token) {
        return false;
      }

      // In a real implementation, you would check DNS records here
      // For now, we'll just mark it as verified
      await prisma.customDomain.update({
        where: { id: customDomain.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });

      await prisma.$disconnect();
      return true;
    } catch (error) {
      console.error('Error verifying custom domain:', error);
      await prisma.$disconnect();
      return false;
    }
  }

  // Generate CSS variables from branding config
  static generateCSSVariables(config: BrandConfig): string {
    return `
      :root {
        --primary-color: ${config.primaryColor || '#3b82f6'};
        --secondary-color: ${config.secondaryColor || '#1e40af'};
        --font-family: ${config.fontFamily || 'system-ui, -apple-system, sans-serif'};
        --company-name: "${config.companyName || 'Market Intelligence'}";
        --support-email: "${config.supportEmail || 'support@example.com'}";
      }
    `;
  }

  // Generate verification token for domain verification
  private static generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Get all custom domains for an organization
  static async getOrganizationDomains(organizationId: string): Promise<CustomDomain[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const domains = await prisma.customDomain.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      });

      await prisma.$disconnect();
      return domains;
    } catch (error) {
      console.error('Error fetching organization domains:', error);
      await prisma.$disconnect();
      return [];
    }
  }

  // Remove custom domain
  static async removeCustomDomain(domainId: string, organizationId: string): Promise<boolean> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const result = await prisma.customDomain.deleteMany({
        where: {
          id: domainId,
          organizationId,
        },
      });

      await prisma.$disconnect();
      return result.count > 0;
    } catch (error) {
      console.error('Error removing custom domain:', error);
      await prisma.$disconnect();
      return false;
    }
  }

  // Generate branded HTML head
  static generateBrandedHead(config: BrandConfig): string {
    return `
      <style>
        ${this.generateCSSVariables(config)}
        body {
          font-family: var(--font-family);
        }
        ${config.customCSS || ''}
      </style>
      ${config.favicon ? `<link rel="icon" href="${config.favicon}" />` : ''}
      <title>${config.companyName || 'Market Intelligence'} - Dashboard</title>
    `;
  }
}