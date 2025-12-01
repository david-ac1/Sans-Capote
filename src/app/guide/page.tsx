"use client";

import { useState } from "react";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
}

interface ConversationResponse {
  answer: string;
  suggestions: string[];
  safetyNotice: string;
}

export default function GuidePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I'm your private guide for HIV prevention and sexual health in African contexts. You can ask about PrEP, PEP, testing, STIs, condoms, relationships, and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "I had unprotected sex last night, what should I do?",
    "How can I get PrEP in Nigeria?",
    "What are signs of STIs without showing pictures?",
  ]);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          language: "en",
          mode: "general",
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = (await res.json()) as ConversationResponse;

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer },
      ]);
      setSuggestions(data.suggestions);
    } catch (e) {
      console.error(e);
      setError(
        "We couldn't answer right now. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function handleSuggestionClick(text: string) {
    void sendMessage(text);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1 pb-3">
        <h1 className="text-xl font-semibold">AI Sexual Health Guide</h1>
        <p className="text-xs text-zinc-300">
          Ask your questions in private. This space is stigma-free and does not
          store your messages.
        </p>
      </header>

      <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-[10px] text-zinc-300">
          <span>Conversation</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
            {loading ? "Thinking…" : "Online mode"}
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "assistant" ? "flex justify-start" : "flex justify-end"
              }
            >
              <div
                className={
                  m.role === "assistant"
                    ? "max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-800 px-3 py-2 text-zinc-100"
                    : "max-w-[80%] rounded-2xl rounded-br-sm bg-emerald-500 px-3 py-2 text-zinc-950"
                }
              >
                <p>{m.content}</p>
              </div>
            </div>
          ))}

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-[11px] text-red-100">
              {error}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-semibold text-zinc-400">
                Try one of these questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[10px] text-zinc-100 hover:border-emerald-500"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t border-zinc-800 bg-zinc-950/80 px-3 py-2"
        >
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[11px] text-zinc-200"
          >
            Mic
          </button>
          <div className="flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="w-full bg-transparent text-[11px] text-zinc-100 outline-none placeholder:text-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 items-center justify-center rounded-full bg-emerald-500 px-3 text-[11px] font-semibold text-zinc-950 disabled:opacity-60"
          >
            Send
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[11px] text-zinc-200"
          >
            Play
          </button>
        </form>
      </section>
    </main>
  );
}
