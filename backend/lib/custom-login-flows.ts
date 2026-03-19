import { Organization } from '@prisma/client';

export interface LoginFlowConfig {
  id: string;
  organizationId: string;
  customLogo?: string;
  customBackground?: string;
  welcomeMessage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  buttonText?: string;
  customCSS?: string;
  redirectUrl?: string;
  showSocialLogin?: boolean;
  showSSO?: boolean;
  showMagicLink?: boolean;
  showBiometric?: boolean;
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  supportEmail?: string;
  companyDescription?: string;
}

export class CustomLoginFlowService {
  // Get login flow configuration for organization
  static async getLoginFlowConfig(organizationId: string): Promise<LoginFlowConfig | null> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          settings: true,
          logo: true,
          domain: true,
          name: true,
        },
      });

      if (!organization) {
        return null;
      }

      const settings = JSON.parse(organization.settings || '{}');
      const loginConfig = settings.loginFlow || {};

      return {
        id: organizationId,
        organizationId,
        customLogo: loginConfig.customLogo || organization.logo,
        customBackground: loginConfig.customBackground,
        welcomeMessage: loginConfig.welcomeMessage || `Welcome to ${organization.name}`,
        primaryColor: loginConfig.primaryColor || '#3b82f6',
        secondaryColor: loginConfig.secondaryColor || '#1e40af',
        buttonText: loginConfig.buttonText || 'Sign In',
        customCSS: loginConfig.customCSS,
        redirectUrl: loginConfig.redirectUrl,
        showSocialLogin: loginConfig.showSocialLogin !== false,
        showSSO: loginConfig.showSSO || false,
        showMagicLink: loginConfig.showMagicLink || false,
        showBiometric: loginConfig.showBiometric || false,
        termsOfServiceUrl: loginConfig.termsOfServiceUrl,
        privacyPolicyUrl: loginConfig.privacyPolicyUrl,
        supportEmail: loginConfig.supportEmail || 'support@example.com',
        companyDescription: loginConfig.companyDescription,
      };
    } catch (error) {
      console.error('Error fetching login flow config:', error);
      return null;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Update login flow configuration
  static async updateLoginFlowConfig(
    organizationId: string,
    config: Partial<LoginFlowConfig>
  ): Promise<boolean> {
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
        loginFlow: {
          ...currentSettings.loginFlow,
          ...config,
        },
      };

      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          settings: JSON.stringify(updatedSettings),
        },
      });

      await prisma.$disconnect();
      return true;
    } catch (error) {
      console.error('Error updating login flow config:', error);
      await prisma.$disconnect();
      return false;
    }
  }

  // Get login flow by domain
  static async getLoginFlowByDomain(domain: string): Promise<LoginFlowConfig | null> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const customDomain = await prisma.customDomain.findUnique({
        where: { domain, isVerified: true },
        include: {
          organization: true,
        },
      });

      if (!customDomain) {
        return null;
      }

      return await this.getLoginFlowConfig(customDomain.organizationId);
    } catch (error) {
      console.error('Error fetching login flow by domain:', error);
      return null;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Generate custom login page HTML
  static generateCustomLoginPage(config: LoginFlowConfig): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - ${config.welcomeMessage}</title>
    <style>
        :root {
            --primary-color: ${config.primaryColor};
            --secondary-color: ${config.secondaryColor};
            --font-family: system-ui, -apple-system, sans-serif;
        }
        
        body {
            font-family: var(--font-family);
            margin: 0;
            padding: 0;
            background: ${config.customBackground || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .login-container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 100%;
            max-width: 400px;
        }
        
        .logo {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .logo img {
            max-height: 60px;
            margin-bottom: 1rem;
        }
        
        .welcome-message {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            text-align: center;
            margin-bottom: 0.5rem;
        }
        
        .company-description {
            text-align: center;
            color: #6b7280;
            margin-bottom: 2rem;
            font-size: 0.875rem;
        }
        
        .button {
            width: 100%;
            padding: 0.75rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .button:hover {
            background: var(--secondary-color);
        }
        
        .divider {
            text-align: center;
            margin: 1.5rem 0;
            position: relative;
        }
        
        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #e5e7eb;
        }
        
        .divider span {
            background: white;
            padding: 0 1rem;
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .social-login {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .social-button {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-decoration: none;
            color: #374151;
            font-size: 0.875rem;
            transition: background-color 0.2s;
        }
        
        .social-button:hover {
            background: #f9fafb;
        }
        
        .footer {
            text-align: center;
            margin-top: 2rem;
            font-size: 0.75rem;
            color: #6b7280;
        }
        
        .footer a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        ${config.customCSS || ''}
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            ${config.customLogo ? `<img src="${config.customLogo}" alt="Company Logo">` : ''}
            <div class="welcome-message">${config.welcomeMessage}</div>
            ${config.companyDescription ? `<div class="company-description">${config.companyDescription}</div>` : ''}
        </div>
        
        <form id="loginForm">
            <input type="email" placeholder="Email address" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 0.75rem;">
            <input type="password" placeholder="Password" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 1rem;">
            <button type="submit" class="button">${config.buttonText}</button>
        </form>
        
        ${config.showSocialLogin ? `
        <div class="divider">
            <span>Or continue with</span>
        </div>
        <div class="social-login">
            <a href="/auth/signin/google" class="social-button">
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
            </a>
        </div>
        ` : ''}
        
        ${config.showMagicLink ? `
        <div style="text-align: center; margin-top: 1rem;">
            <a href="/auth/magic-link" style="color: var(--primary-color); text-decoration: none; font-size: 0.875rem;">
                Send magic link (passwordless)
            </a>
        </div>
        ` : ''}
        
        <div class="footer">
            ${config.termsOfServiceUrl ? `<a href="${config.termsOfServiceUrl}">Terms of Service</a>` : ''}
            ${config.termsOfServiceUrl && config.privacyPolicyUrl ? ' • ' : ''}
            ${config.privacyPolicyUrl ? `<a href="${config.privacyPolicyUrl}">Privacy Policy</a>` : ''}
            ${config.supportEmail ? `<div style="margin-top: 0.5rem;">Contact: <a href="mailto:${config.supportEmail}">${config.supportEmail}</a></div>` : ''}
        </div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle login submission
            window.location.href = '${config.redirectUrl || '/dashboard'}';
        });
    </script>
</body>
</html>`;
  }

  // Get all login flow configurations for admin
  static async getAllLoginFlowConfigs(): Promise<Array<LoginFlowConfig & { organizationName: string; domain?: string }>> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const organizations = await prisma.organization.findMany({
        include: {
          customDomains: {
            where: { isVerified: true },
            take: 1,
          },
        },
      });

      const configs = [];
      for (const org of organizations) {
        const config = await this.getLoginFlowConfig(org.id);
        if (config) {
          configs.push({
            ...config,
            organizationName: org.name,
            domain: org.customDomains[0]?.domain,
          });
        }
      }

      return configs;
    } catch (error) {
      console.error('Error fetching all login flow configs:', error);
      return [];
    } finally {
      await prisma.$disconnect();
    }
  }
}