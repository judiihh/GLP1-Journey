import { NextResponse } from "next/server";
import {
  buildAssistantSystemPrompt,
  isAssistantConfigured,
  type ChatMessage,
} from "@/lib/assistant";
import { getGroqApiKey, getGroqModel, GROQ_CHAT_API } from "@/lib/groq";
import type { UserProfile } from "@/lib/types";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;

export async function POST(request: Request) {
  if (!isAssistantConfigured()) {
    return NextResponse.json(
      {
        error:
          "Assistant is not configured. Add GROQ_API_KEY to .env.local and restart the dev server. Get a free key at https://console.groq.com/keys",
      },
      { status: 503 }
    );
  }

  let body: { messages?: ChatMessage[]; profile?: UserProfile | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages?.slice(-MAX_MESSAGES) ?? [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const last = messages[messages.length - 1];
  if (last.role !== "user" || !last.content.trim()) {
    return NextResponse.json(
      { error: "Last message must be from the user." },
      { status: 400 }
    );
  }

  for (const msg of messages) {
    if (msg.content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: "Message too long." }, { status: 400 });
    }
    if (msg.role !== "user" && msg.role !== "assistant") {
      return NextResponse.json({ error: "Invalid message role." }, { status: 400 });
    }
  }

  const apiKey = getGroqApiKey()!;
  const systemPrompt = buildAssistantSystemPrompt(body.profile ?? null);

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  try {
    const res = await fetch(GROQ_CHAT_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getGroqModel(),
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const raw =
        data?.error?.message ?? "The assistant could not respond right now.";
      const message =
        res.status === 429
          ? "Rate limit reached. Wait a moment and try again."
          : raw;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!reply) {
      return NextResponse.json(
        { error: "Empty response from assistant." },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: reply });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the assistant service." },
      { status: 502 }
    );
  }
}
