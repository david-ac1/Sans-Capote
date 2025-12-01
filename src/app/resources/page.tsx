"use client";

import { useState } from "react";
import { resources } from "../../data/resources";
import { useSettings } from "../settings-provider";

export default function ResourcesPage() {
  const { language } = useSettings();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleListen(id: string, text: string) {
    if (!text.trim()) return;
    setPlayingId(id);
    setError(null);

    try {
      const res = await fetch("/api/voice-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      if (!res.ok) {
        throw new Error("Voice request failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play().catch((err) => {
        console.error("Audio play error", err);
        setError(
          "We generated audio but your browser could not play it. Please try again."
        );
      });
    } catch (e) {
      console.error(e);
      setError(
        "We could not generate audio right now. Please try again in a moment."
      );
    } finally {
      setPlayingId(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Education Hub</h1>
        <p className="text-xs text-zinc-300">
          Short, simple explanations about HIV, STIs, LGBTQ+ health, consent,
          and mental health.
        </p>
      </header>

      {error && (
        <section className="rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-[11px] text-red-100">
          {error}
        </section>
      )}

      {resources.map((category) => (
        <section
          key={category.id}
          className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-xs text-zinc-100"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
              {category.title}
            </p>
            <p className="text-[11px] text-zinc-300">{category.description}</p>
          </div>

          <div className="space-y-2">
            {category.items.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h2 className="text-[11px] font-semibold text-zinc-100">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-[11px] text-zinc-300">
                      {item.summary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleListen(item.id, item.summary)}
                    disabled={playingId === item.id}
                    className="ml-1 flex h-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 px-2 text-[10px] text-zinc-200 disabled:opacity-60"
                  >
                    {playingId === item.id ? "..." : "Listen"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
