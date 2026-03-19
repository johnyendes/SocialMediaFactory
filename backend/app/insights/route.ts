import { NextResponse } from "next/server";
import { generateInsight } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    const insight = await generateInsight(prompt);
    return NextResponse.json({ insight });
  } catch (error) {
    console.error("AI Insight error:", error);
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}