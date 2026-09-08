"use client";

import { useEffect, useRef, useState } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useApp } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ASSISTANT_DISCLAIMER,
  SUGGESTED_QUESTIONS,
  type ChatMessage,
} from "@/lib/assistant";
import {
  clearAssistantMessages,
  fetchAssistantMessages,
  saveAssistantMessage,
} from "@/lib/assistant-storage";
import { Bot, Send, User, AlertCircle, Sparkles, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/cn";

function formatMessageTime(iso?: string): string {
  if (!iso) return "";
  const date = parseISO(iso);
  const time = format(date, "h:mm a");
  if (isToday(date)) return `Today · ${time}`;
  if (isYesterday(date)) return `Yesterday · ${time}`;
  return format(date, "MMM d · h:mm a");
}

function dateDividerLabel(iso?: string): string | null {
  if (!iso) return null;
  const date = parseISO(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
}

export default function AssistantPage() {
  const { data } = useApp();
  const { profile } = data;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    fetchAssistantMessages(user.id).then((history) => {
      if (!cancelled) {
        setMessages(history);
        setHistoryLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (historyLoaded && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [historyLoaded, messages.length]);

  if (!profile) return null;

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const persistMessage = async (message: ChatMessage) => {
    const saved = await saveAssistantMessage(user?.id, message);
    setMessages((prev) => {
      const withoutDup = prev.filter((m) => m.id !== saved.id);
      return [...withoutDup, saved];
    });
    return saved;
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setLoading(true);
    scrollToBottom();

    await persistMessage(userMessage);

    const historyForApi = [...messages, userMessage];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi.map(({ role, content }) => ({ role, content })),
          profile,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await persistMessage(assistantMessage);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        "Clear all assistant chat history? This cannot be undone."
      )
    ) {
      return;
    }
    await clearAssistantMessages(user?.id);
    setMessages([]);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showEmptyState = historyLoaded && messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-6rem)] max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-1">
        <PageHeader
          title="Wellness Assistant"
          subtitle="Your questions and answers are saved automatically"
        />
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="shrink-0 mt-1 flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors touch-manipulation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      <Card className="mb-4 bg-rose-50/60 border-rose-100/80 py-3 px-4">
        <p className="text-xs text-rose-600/90 leading-relaxed flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {ASSISTANT_DISCLAIMER}
        </p>
      </Card>

      <Card className="flex-1 flex flex-col min-h-0 mb-4 overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {!historyLoaded ? (
            <div className="flex justify-center py-12">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          ) : showEmptyState ? (
            <div className="text-center py-8 px-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-lavender-200 to-rose-200 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
                {`Hi ${profile.name}! Ask me anything about your GLP-1 journey — side effects, meals, protein, injections, and more.`}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    className="text-left text-xs px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition-colors touch-manipulation disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const prevDate = messages[i - 1]?.createdAt;
              const showDivider =
                msg.createdAt &&
                (i === 0 ||
                  dateDividerLabel(msg.createdAt) !==
                    dateDividerLabel(prevDate));

              return (
                <div key={msg.id ?? i}>
                  {showDivider && msg.createdAt && (
                    <div className="flex justify-center mb-4">
                      <span className="text-[11px] font-medium text-rose-400/90 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-100/80">
                        {dateDividerLabel(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex gap-3 mb-4",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lavender-300 to-rose-300 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-lavender-400 text-white rounded-br-md"
                          : "bg-rose-50 text-gray-700 border border-rose-100 rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.createdAt && (
                        <p
                          className={cn(
                            "text-[10px] mt-2 opacity-70",
                            msg.role === "user" ? "text-white/80" : "text-rose-400"
                          )}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-lavender-500" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lavender-300 to-rose-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-4 mb-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-rose-100/80 p-3 sm:p-4 flex gap-2 bg-white/50"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a wellness question..."
            disabled={loading || !historyLoaded}
            className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-lavender-100 bg-white focus:outline-none focus:ring-2 focus:ring-lavender-300/80 focus:border-rose-200 text-sm disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim() || !historyLoaded}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Send</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
