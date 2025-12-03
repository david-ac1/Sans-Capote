"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "../settings-provider";
import { strings, t } from "../../i18n/strings";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
  timestamp: number;
  fullContent?: string;
}

interface ConversationResponse {
  answer: string;
  suggestions: string[];
}

type SpeechRecognition = any;

export default function GuidePage() {
  const { language, countryCode, playbackRate, voicePreference } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "I had unprotected sex last night, what should I do?",
    "How can I get PrEP in Nigeria?",
    "What are signs of STIs without showing pictures?",
  ]);
  const [error, setError] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastSpokenAssistantRef = useRef<string | null>(null);

  // Initialize messages on client side only to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          role: "assistant",
          content: language === "fr"
            ? "Bonjour ! Je suis votre assistant éducatif sur le VIH. Comment puis-je vous aider aujourd'hui ?"
            : "Hello! I'm your HIV education assistant. How can I help you today?",
          timestamp: Date.now(),
        },
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized, language]);

  // Get latest assistant message
  const latestAssistantMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === "assistant")?.content || null;

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Focus behavior depending on preferred input method
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (voicePreference === 'text' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [voicePreference]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function playAssistantMessage(text: string) {
    if (!text || voiceLoading) return;

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setVoiceLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/voice-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `Audio generation failed (status: ${res.status})`
        );
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("Received empty audio file from server");
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      // Apply user-controlled playback speed for faster reading
      try {
        audio.playbackRate = playbackRate ?? 1.2;
      } catch (e) {
        // ignore if browser doesn't allow setting playbackRate yet
      }
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      await audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio play error", err);
          setError(
            language === "fr"
              ? "Le son a été généré mais votre navigateur n'a pas pu le lire. Veuillez réessayer."
              : "We generated audio but your browser could not play it. Please try again."
          );
        });
    } catch (e) {
      console.error("Voice error:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(
        language === "fr"
          ? `Impossible de générer l'audio: ${errorMsg}. Vérifiez votre connexion et réessayez.`
          : `Could not generate audio: ${errorMsg}. Please check your connection and try again.`
      );
    } finally {
      setVoiceLoading(false);
    }
  }

  function stopAssistantAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }

  // Auto-play latest assistant answer once there is at least one user message
  useEffect(() => {
    const hasUserMessage = messages.some((m) => m.role === "user");
    if (!hasUserMessage || !latestAssistantMessage) return;
    if (lastSpokenAssistantRef.current === latestAssistantMessage) return;
    lastSpokenAssistantRef.current = latestAssistantMessage;
    // Play a short preview quickly for faster feedback (first ~400 chars)
    const PREVIEW_CHARS = 400;
    const previewText = latestAssistantMessage.slice(0, PREVIEW_CHARS);
    void playAssistantMessage(previewText);
  }, [latestAssistantMessage, language, messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed, timestamp: Date.now() },
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
          language,
          countryCode,
          mode: "general",
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = (await res.json()) as ConversationResponse & { fullAnswer?: string; shortAnswer?: string };

      const assistantContent = data.shortAnswer || data.answer;
      const fullContent = data.fullAnswer || data.answer;

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: assistantContent,
          fullContent,
          timestamp: Date.now(),
        },
      ]);
      setSuggestions(data.suggestions);
    } catch (e) {
      console.error(e);
      setError(
        language === "fr"
          ? "Nous ne pouvons pas répondre pour le moment. Vérifiez votre connexion et réessayez."
          : "We couldn't answer right now. Please check your connection and try again."
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

  async function handleMicClick() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        language === "fr"
          ? "La reconnaissance vocale n'est pas disponible sur ce navigateur."
          : "Voice input is not available on this browser."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "fr" ? "fr-FR" : "en-US";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = "";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setError(
            language === "fr"
              ? "L'accès au micro a été refusé. Vérifiez les autorisations du navigateur."
              : "Microphone access was denied. Please check your browser permissions."
          );
        } else if (event.error !== "no-speech") {
          setError(
            language === "fr"
              ? "Un problème est survenu avec la reconnaissance vocale. Veuillez réessayer."
              : "There was a problem with speech recognition. Please try again."
          );
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        const combined = `${finalTranscript}${interimTranscript}`.trim();
        if (combined) {
          setInput(combined);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition init error", e);
      setIsListening(false);
      setError(
        language === "fr"
          ? "Impossible de démarrer la reconnaissance vocale sur ce navigateur."
          : "Could not start voice recognition on this browser."
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1 pb-3">
        <h1 className="text-xl font-semibold">
          {t(strings.guide.title, language)}
        </h1>
        <p className="text-xs text-zinc-300">
          {t(strings.guide.intro, language)}
        </p>
      </header>

      <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-[10px] text-zinc-300">
          <span>{language === "fr" ? "Conversation" : "Conversation"}</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
            {loading
              ? language === "fr"
                ? "Réflexion…"
                : "Thinking…"
              : language === "fr"
              ? "Mode en ligne"
              : "Online mode"}
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-xs">
          {messages.map((m, idx) => {
            const paragraphs = m.content.split(/\n\n+/);
            return (
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
                  {paragraphs.map((para, pIndex) => {
                    const lines = para.split(/\n+/);
                    return (
                      <p key={pIndex} className={pIndex > 0 ? "mt-2" : undefined}>
                        {lines.map((line, lIndex) => (
                          <span key={lIndex}>
                            {line}
                            {lIndex < lines.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    );
                  })}
                  {m.role === 'assistant' && m.fullContent && m.fullContent.length > m.content.length && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Replace this message with the full content and play it
                          setMessages((cur) =>
                            cur.map((msg, i) =>
                              i === idx ? { ...msg, content: msg.fullContent ?? msg.content } : msg
                            )
                          );
                          void playAssistantMessage(m.fullContent ?? m.content);
                        }}
                        className="text-[11px] text-emerald-300"
                      >
                        {language === 'fr' ? 'Lire la suite' : 'Read full'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-[11px] text-red-100">
              {error}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-semibold text-zinc-400">
                {t(strings.guide.examplesTitle, language)}
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
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t border-zinc-800 bg-zinc-950/80 px-3 py-2"
        >
          <button
            type="button"
            onClick={handleMicClick}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full border px-0.5 text-[11px] text-zinc-200 transition-all ${
              voicePreference === 'voice'
                ? isListening
                  ? 'border-emerald-400 bg-emerald-600/10'
                  : 'border-emerald-500 bg-emerald-600/5'
                : 'border-zinc-700 bg-zinc-900'
            }`}
          >
            {/* Listening/wavy rings */}
            {isListening && (
              <>
                <span className="absolute -inset-1 rounded-full border-2 border-emerald-400/30 animate-ping" />
                <span className="absolute -inset-2 rounded-full border border-emerald-400/20" />
              </>
            )}
            <span className="relative z-10">
              {isListening ? (language === "fr" ? "Rec" : "Rec") : "Mic"}
            </span>
          </button>
          <div className="flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                voicePreference === 'voice'
                  ? language === "fr"
                    ? "Appuyez sur le micro et parlez…"
                    : "Tap the mic and speak…"
                  : language === "fr"
                  ? "Écrivez votre question…"
                  : "Type your question…"
              }
                ref={inputRef}
                className="w-full bg-transparent text-[11px] text-zinc-100 outline-none placeholder:text-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 items-center justify-center rounded-full bg-emerald-500 px-3 text-[11px] font-semibold text-zinc-950 disabled:opacity-60"
          >
            {language === "fr" ? "Envoyer" : "Send"}
          </button>
          <button
            type="button"
            disabled={voiceLoading || !latestAssistantMessage}
            onClick={async () => {
              if (!latestAssistantMessage || voiceLoading) return;
              if (isPlaying) {
                stopAssistantAudio();
              } else {
                await playAssistantMessage(latestAssistantMessage);
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[11px] text-zinc-200 disabled:opacity-60"
          >
            {voiceLoading
              ? "..."
              : isPlaying
              ? language === "fr"
                ? "Pause"
                : "Pause"
              : language === "fr"
              ? "Lire"
              : "Play"}
          </button>
        </form>
      </section>
    </main>
  );
}