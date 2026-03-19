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
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to disable MFA" },
        { status: 400 }
      );
    }

    // TODO: Verify user password before allowing MFA disable
    // This would require the user to re-authenticate

    await MFAService.disableMFA(userId);

    return NextResponse.json({
      success: true,
      message: "MFA has been disabled successfully"
    });

  } catch (error) {
    console.error("MFA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable MFA" },
      { status: 500 }
    );
  }
}