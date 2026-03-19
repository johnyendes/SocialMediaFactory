import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { MFAService } from "@/lib/mfa";
import { prisma } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get user token
    const token = await getToken({ req: request });
    
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = token.sub;
    const { token: totpToken, backupCode } = await request.json();

    if (!totpToken && !backupCode) {
      return NextResponse.json(
        { error: "TOTP token or backup code is required" },
        { status: 400 }
      );
    }

    let isValid = false;
    let method: 'totp' | 'backup' = 'totp';

    // Get user's MFA secret
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.metadata) {
      return NextResponse.json(
        { error: "MFA not set up for this account" },
        { status: 400 }
      );
    }

    const metadata = user.metadata as any;
    const mfaSecret = metadata.mfaSecret;

    if (!mfaSecret) {
      return NextResponse.json(
        { error: "MFA not set up for this account" },
        { status: 400 }
      );
    }

    // Verify TOTP token
    if (totpToken) {
      isValid = MFAService.verifyTOTP(mfaSecret, totpToken);
      method = 'totp';
    }

    // Verify backup code if TOTP failed
    if (!isValid && backupCode) {
      isValid = await MFAService.verifyBackupCode(userId, backupCode);
      method = 'backup';
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Enable MFA if verification is successful
    if (method === 'totp') {
      await MFAService.enableMFA(userId);
    }

    // Track MFA verification
    await prisma.userActivity.create({
      data: {
        userId,
        action: "MFA_VERIFIED",
        resource: "SECURITY",
        metadata: {
          method,
          verifiedAt: new Date(),
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: method === 'totp' 
        ? "MFA has been enabled successfully" 
        : "Backup code verified. Please set up a new authenticator to enable MFA.",
      method
    });

  } catch (error) {
    console.error("MFA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify MFA" },
      { status: 500 }
    );
  }
}