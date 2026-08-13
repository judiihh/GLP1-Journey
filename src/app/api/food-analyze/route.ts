import { NextResponse } from "next/server";
import { isAssistantConfigured } from "@/lib/assistant";
import { callGroqFoodVision, parseFoodAnalysis } from "@/lib/food-analyze-ai";
import type { UserProfile } from "@/lib/types";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isAssistantConfigured()) {
    return NextResponse.json(
      {
        error:
          "Food analyzer is not configured. Add GROQ_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  let body: {
    profile?: UserProfile | null;
    imageBase64?: string;
    mimeType?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.profile) {
    return NextResponse.json({ error: "Profile is required." }, { status: 400 });
  }

  if (!body.imageBase64?.trim()) {
    return NextResponse.json({ error: "Photo is required." }, { status: 400 });
  }

  const mimeType = body.mimeType?.startsWith("image/")
    ? body.mimeType
    : "image/jpeg";

  const approxBytes = Math.ceil((body.imageBase64.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Try a smaller photo." },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.GROQ_API_KEY!.trim();
    const reply = await callGroqFoodVision(
      apiKey,
      body.imageBase64,
      mimeType,
      body.profile
    );
    const analysis = parseFoodAnalysis(reply, body.profile);
    return NextResponse.json({ analysis });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to analyze meal photo.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
