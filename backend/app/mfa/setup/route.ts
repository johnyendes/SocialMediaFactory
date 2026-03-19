import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { MFAService } from "@/lib/mfa";

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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for MFA setup" },
        { status: 400 }
      );
    }

    // Check if MFA is already enabled
    const mfaStatus = await MFAService.getMFAStatus(userId);
    if (mfaStatus.enabled) {
      return NextResponse.json(
        { error: "MFA is already enabled for this account" },
        { status: 400 }
      );
    }

    // Setup MFA
    const mfaSetup = await MFAService.setupMFA(userId, email);

    return NextResponse.json({
      success: true,
      qrCode: mfaSetup.qrCode,
      secret: mfaSetup.secret,
      backupCodes: mfaSetup.backupCodes,
      manualEntryKey: mfaSetup.manualEntryKey,
      instructions: {
        step1: "Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)",
        step2: "Or manually enter the secret key in your authenticator app",
        step3: "Enter the 6-digit code from your app to verify and enable MFA",
        step4: "Save your backup codes in a secure location for account recovery",
      }
    });

  } catch (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup MFA" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    const mfaStatus = await MFAService.getMFAStatus(userId);

    return NextResponse.json({
      success: true,
      mfaStatus
    });

  } catch (error) {
    console.error("MFA status error:", error);
    return NextResponse.json(
      { error: "Failed to get MFA status" },
      { status: 500 }
    );
  }
}