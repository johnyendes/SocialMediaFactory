import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getUserStats } from "@/lib/auth-middleware";

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
    const userStats = await getUserStats(userId);

    return NextResponse.json(userStats);

  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}