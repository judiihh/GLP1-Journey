import { NextResponse } from "next/server";
import { isAssistantConfigured } from "@/lib/assistant";
import {
  buildMealPlanPrompt,
  buildMealPlanUserMessage,
  parseAiMealPlan,
} from "@/lib/meal-plan-ai";
import { todayISO } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

const MODEL = "llama-3.3-70b-versatile";
const MAX_ATTEMPTS = 3;

async function callGroqMealPlan(
  apiKey: string,
  profile: UserProfile
): Promise<string> {
  const systemPrompt = buildMealPlanPrompt(profile);
  const userMessage = buildMealPlanUserMessage(profile);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 1,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const raw =
      data?.error?.message ?? "Could not generate meal plan right now.";
    const message =
      res.status === 429
        ? "Rate limit reached. Wait a moment and try again."
        : raw;
    throw new Error(message);
  }

  const reply = data?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!reply) {
    throw new Error("Empty response from meal planner.");
  }

  return reply;
}

export async function POST(request: Request) {
  if (!isAssistantConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI meal plans are not configured. Add GROQ_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  let body: { profile?: UserProfile | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.profile) {
    return NextResponse.json({ error: "Profile is required." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY!.trim();
  let lastError = "Failed to generate meal plan.";

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const reply = await callGroqMealPlan(apiKey, body.profile);
        const plan = parseAiMealPlan(reply, body.profile, todayISO());
        return NextResponse.json({ plan });
      } catch (err) {
        lastError =
          err instanceof Error ? err.message : "Failed to generate meal plan.";
        // Retry when AI copied templates or used excluded ingredients
        if (
          !lastError.includes("quick-plan meals") &&
          !lastError.includes("excluded ingredient")
        ) {
          break;
        }
      }
    }

    return NextResponse.json({ error: lastError }, { status: 502 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate meal plan.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
