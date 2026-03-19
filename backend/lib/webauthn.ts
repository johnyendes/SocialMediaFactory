import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/types';

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const rpName = process.env.WEBAUTHN_RP_NAME || 'Market Intelligence';
const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export interface WebAuthnUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthenticatorDevice {
  credentialID: Buffer;
  credentialPublicKey: Buffer;
  counter: number;
  transports?: AuthenticatorTransport[];
}

export class WebAuthnService {
  // Generate registration options for new biometric device
  static generateRegistrationOptions(user: WebAuthnUser) {
    return generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email,
      userDisplayName: user.name || user.email,
      // Don't prompt users for additional information about the authenticator
      // Recommended to avoid, for better user experience
      attestationType: 'none',
      // Prevent users from registering authenticators they've already registered
      excludeCredentials: [],
      // See "Guiding Use of Authenticators via authenticatorSelection" below
      authenticatorSelection: {
        // Defaults
        residentKey: 'preferred',
        userVerification: 'preferred',
        // Optional - Remove platform preference to allow hardware keys
        // authenticatorAttachment: 'platform',
      },
    });
  }

  // Verify registration response
  static async verifyRegistration(
    response: RegistrationResponseJSON,
    expectedChallenge: string,
    expectedOrigin: string,
    expectedRPID: string
  ) {
    try {
      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin,
        expectedRPID,
        requireUserVerification: true,
      });

      return verification;
    } catch (error) {
      console.error('Registration verification failed:', error);
      throw error;
    }
  }

  // Generate authentication options for existing biometric device
  static generateAuthenticationOptions(userDevices: AuthenticatorDevice[]) {
    return generateAuthenticationOptions({
      rpID,
      // Require user verification for biometric auth
      userVerification: 'required',
      // Use the user's existing devices for authentication
      allowCredentials: userDevices.map(device => ({
        id: device.credentialID,
        type: 'public-key',
        transports: device.transports,
      })),
    });
  }

  // Verify authentication response
  static async verifyAuthentication(
    response: AuthenticationResponseJSON,
    expectedChallenge: string,
    expectedOrigin: string,
    expectedRPID: string,
    authenticator: AuthenticatorDevice
  ) {
    try {
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin,
        expectedRPID,
        authenticator,
        requireUserVerification: true,
      });

      return verification;
    } catch (error) {
      console.error('Authentication verification failed:', error);
      throw error;
    }
  }

  // Store authenticator device in database
  static async storeAuthenticatorDevice(
    userId: string,
    device: {
      credentialID: Buffer;
      credentialPublicKey: Buffer;
      counter: number;
      transports?: AuthenticatorTransport[];
      name?: string;
    }
  ) {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.authenticatorDevice.create({
        data: {
          userId,
          credentialID: device.credentialID.toString('base64'),
          credentialPublicKey: device.credentialPublicKey.toString('base64'),
          counter: device.counter,
          transports: JSON.stringify(device.transports || []),
          name: device.name || 'Biometric Device',
          createdAt: new Date(),
        },
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error('Failed to store authenticator device:', error);
      throw error;
    }
  }

  // Get user's authenticator devices
  static async getUserAuthenticators(userId: string): Promise<AuthenticatorDevice[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const devices = await prisma.authenticatorDevice.findMany({
        where: { userId },
      });

      return devices.map(device => ({
        credentialID: Buffer.from(device.credentialID, 'base64'),
        credentialPublicKey: Buffer.from(device.credentialPublicKey, 'base64'),
        counter: device.counter,
        transports: JSON.parse(device.transports || '[]') as AuthenticatorTransport[],
      }));
    } catch (error) {
      console.error('Failed to get user authenticators:', error);
      return [];
    } finally {
      await prisma.$disconnect();
    }
  }

  // Update authenticator counter after successful authentication
  static async updateAuthenticatorCounter(
    credentialID: Buffer,
    newCounter: number
  ) {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.authenticatorDevice.updateMany({
        where: {
          credentialID: credentialID.toString('base64'),
        },
        data: {
          counter: newCounter,
          lastUsedAt: new Date(),
        },
      });

      await prisma.$disconnect();
    } catch (error) {
      console.error('Failed to update authenticator counter:', error);
      throw error;
    }
  }

  // Check if user has biometric devices
  static async hasBiometricDevices(userId: string): Promise<boolean> {
    const devices = await this.getUserAuthenticators(userId);
    return devices.length > 0;
  }
}

// Export configuration for client-side use
export const webAuthnConfig = {
  rpID,
  rpName,
  origin,
};