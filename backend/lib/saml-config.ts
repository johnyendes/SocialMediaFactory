import { SamlStrategy } from '@node-saml/passport-saml';

export interface SAMLOptions {
  entryPoint: string;
  issuer: string;
  cert: string;
  privateCert?: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
  nameIdentifierFormat: string;
  attributeMapping: Record<string, string>;
}

// Okta SAML Configuration
export const oktaSAMLConfig: SAMLOptions = {
  entryPoint: process.env.OKTA_ENTRY_POINT || '',
  issuer: process.env.OKTA_ISSUER || '',
  cert: process.env.OKTA_CERT || '',
  privateCert: process.env.OKTA_PRIVATE_CERT || '',
  signatureAlgorithm: 'sha256',
  digestAlgorithm: 'sha256',
  nameIdentifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
  attributeMapping: {
    email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    department: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department',
    title: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/title'
  }
};

// Azure AD SAML Configuration
export const azureSAMLConfig: SAMLOptions = {
  entryPoint: process.env.AZURE_ENTRY_POINT || '',
  issuer: process.env.AZURE_ISSUER || '',
  cert: process.env.AZURE_CERT || '',
  privateCert: process.env.AZURE_PRIVATE_CERT || '',
  signatureAlgorithm: 'sha256',
  digestAlgorithm: 'sha256',
  nameIdentifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
  attributeMapping: {
    email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    name: 'name',
    firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    objectId: 'http://schemas.microsoft.com/identity/claims/objectidentifier',
    tenantId: 'http://schemas.microsoft.com/claims/authnclassreference'
  }
};

export function createSAMLStrategy(config: SAMLOptions, provider: string): SamlStrategy {
  return new SamlStrategy(
    {
      entryPoint: config.entryPoint,
      issuer: config.issuer,
      cert: config.cert,
      privateCert: config.privateCert,
      signatureAlgorithm: config.signatureAlgorithm,
      digestAlgorithm: config.digestAlgorithm,
      nameIdentifierFormat: config.nameIdentifierFormat,
      identifierFormat: config.nameIdentifierFormat,
      passReqToCallback: true,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/saml/${provider}/callback`
    },
    async (req: any, profile: any, done: any) => {
      try {
        // Map SAML attributes to user profile
        const userAttributes = {
          email: profile[config.attributeMapping.email] || profile.Email || profile.email,
          name: profile[config.attributeMapping.name] || profile.Name || profile.name,
          firstName: profile[config.attributeMapping.firstName] || profile.FirstName || profile.firstName,
          lastName: profile[config.attributeMapping.lastName] || profile.LastName || profile.lastName,
          department: profile[config.attributeMapping.department] || profile.Department || profile.department,
          title: profile[config.attributeMapping.title] || profile.Title || profile.title,
          provider: provider,
          providerId: profile.ID || profile.id,
          ssoEnabled: true
        };

        // Find or create user in database
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        let user = await prisma.user.findUnique({
          where: { email: userAttributes.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              ...userAttributes,
              emailVerified: new Date(),
              role: 'USER' // Default role, can be overridden by organization settings
            }
          });
        } else {
          // Update existing user with latest SSO info
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              ...userAttributes,
              lastLoginAt: new Date()
            }
          });
        }

        // Log SSO authentication event
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'SSO_LOGIN',
            resource: `saml/${provider}`,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            metadata: JSON.stringify({
              provider,
              samlResponse: profile.ID || profile.id
            })
          }
        });

        done(null, user);
      } catch (error) {
        console.error('SAML authentication error:', error);
        done(error, null);
      }
    }
  );
}