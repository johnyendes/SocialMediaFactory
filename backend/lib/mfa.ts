import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MFASetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export class MFAService {
  /**
   * Generate a new TOTP secret for a user
   */
  static generateSecret(): string {
    return speakeasy.generateSecret({
      name: 'Market Intelligence',
      issuer: 'Market Intelligence Platform',
      length: 32
    }).base32!;
  }

  /**
   * Generate QR code for TOTP setup
   */
  static async generateQRCode(secret: string, email: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: `Market Intelligence (${email})`,
      issuer: 'Market Intelligence Platform',
    });

    return await QRCode.toDataURL(otpauthUrl);
  }

  /**
   * Generate backup codes for recovery
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  /**
   * Setup MFA for a user
   */
  static async setupMFA(userId: string, email: string): Promise<MFASetupResult> {
    const secret = this.generateSecret();
    const qrCode = await this.generateQRCode(secret, email);
    const backupCodes = this.generateBackupCodes();
    
    // Store MFA setup temporarily (not enabled until verified)
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret,
        mfaBackupCodes: JSON.stringify(backupCodes),
        mfaEnabled: false, // Will be enabled after verification
      }
    });

    return {
      secret,
      qrCode,
      backupCodes,
      manualEntryKey: secret,
    };
  }

  /**
   * Verify TOTP token
   */
  static verifyTOTP(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 steps before/after for clock drift
    });
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(userId: string, code: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.mfaBackupCodes) {
        resolve(false);
        return;
      }

      const backupCodes = JSON.parse(user.mfaBackupCodes);

      if (backupCodes.includes(code)) {
        // Remove used backup code
        const remainingCodes = backupCodes.filter((c: string) => c !== code);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            mfaBackupCodes: JSON.stringify(remainingCodes),
          }
        });

        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Enable MFA after successful verification
   */
  static async enableMFA(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaEnabledAt: new Date(),
      }
    });

    // Track MFA enablement
    await prisma.userActivity.create({
      data: {
        userId,
        action: "MFA_ENABLED",
        resource: "SECURITY",
        metadata: {
          enabledAt: new Date(),
        }
      }
    });
  }

  /**
   * Disable MFA for a user
   */
  static async disableMFA(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: null,
        mfaEnabledAt: null,
      }
    });

    // Track MFA disablement
    await prisma.userActivity.create({
      data: {
        userId,
        action: "MFA_DISABLED",
        resource: "SECURITY",
        metadata: {
          disabledAt: new Date(),
        }
      }
    });
  }

  /**
   * Check if MFA is enabled for a user
   */
  static async isMFAEnabled(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    return user?.mfaEnabled === true;
  }

  /**
   * Get MFA status for a user
   */
  static async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    enabledAt?: Date;
    backupCodesRemaining: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        enabled: false,
        backupCodesRemaining: 0,
      };
    }

    const backupCodes = user.mfaBackupCodes ? JSON.parse(user.mfaBackupCodes) : [];
    
    return {
      enabled: user.mfaEnabled === true,
      enabledAt: user.mfaEnabledAt || undefined,
      backupCodesRemaining: backupCodes.length,
    };
  }
}

/**
 * Middleware for MFA verification
 */
export async function requireMFA(userId: string, token: string, backupCode?: string): Promise<{
  valid: boolean;
  method: 'totp' | 'backup' | 'none';
}> {
  const mfaEnabled = await MFAService.isMFAEnabled(userId);
  
  if (!mfaEnabled) {
    return { valid: true, method: 'none' };
  }

  // If MFA is enabled, verify the token or backup code
  if (token) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.mfaSecret) {
      const isValid = MFAService.verifyTOTP(user.mfaSecret, token);
      if (isValid) {
        return { valid: true, method: 'totp' };
      }
    }
  }

  if (backupCode) {
    const isValid = await MFAService.verifyBackupCode(userId, backupCode);
    if (isValid) {
      return { valid: true, method: 'backup' };
    }
  }

  return { valid: false, method: 'none' };
}