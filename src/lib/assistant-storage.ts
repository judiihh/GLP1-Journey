"use client";

import type { ChatMessage } from "./assistant";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import { v4 as uuidv4 } from "uuid";

const LOCAL_KEY = "glp1-assistant-messages";

function localKey(userId?: string): string {
  return userId ? `${LOCAL_KEY}-${userId}` : LOCAL_KEY;
}

function loadLocal(userId?: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(localKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveLocal(messages: ChatMessage[], userId?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(localKey(userId), JSON.stringify(messages));
}

export async function fetchAssistantMessages(
  userId?: string
): Promise<ChatMessage[]> {
  if (!userId || !isSupabaseConfigured()) {
    return loadLocal(userId);
  }

  try {
    const supabase = createClient();
    if (!supabase) return loadLocal(userId);

    const { data, error } = await supabase
      .from("assistant_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const messages = (data ?? []).map((row) => ({
      id: row.id,
      role: row.role as ChatMessage["role"],
      content: row.content,
      createdAt: row.created_at,
    }));

    saveLocal(messages, userId);
    return messages;
  } catch {
    return loadLocal(userId);
  }
}

export async function saveAssistantMessage(
  userId: string | undefined,
  message: ChatMessage
): Promise<ChatMessage> {
  const stored: ChatMessage = {
    ...message,
    id: message.id ?? uuidv4(),
    createdAt: message.createdAt ?? new Date().toISOString(),
  };

  if (userId && isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase unavailable");

      const { data, error } = await supabase
        .from("assistant_messages")
        .insert({
          id: stored.id,
          user_id: userId,
          role: stored.role,
          content: stored.content,
          created_at: stored.createdAt,
        })
        .select("id, role, content, created_at")
        .single();

      if (error) throw error;

      stored.id = data.id;
      stored.createdAt = data.created_at;
    } catch {
      // Fall through to localStorage
    }
  }

  const existing = loadLocal(userId);
  saveLocal([...existing, stored], userId);
  return stored;
}

export async function clearAssistantMessages(
  userId?: string
): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(localKey(userId));
  }

  if (!userId || !isSupabaseConfigured()) return;

  try {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("assistant_messages").delete().eq("user_id", userId);
  } catch {
    // Local copy already cleared
  }
}
