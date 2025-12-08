"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Send, Volume2, Pause, MessageCircle, Sparkles } from "lucide-react";
import { useSettings } from "../settings-provider";
import GuideVoiceAgent from "../../components/GuideVoiceAgent";
import ErrorBoundary from "../../components/ErrorBoundary";
import SentimentIndicator from "../../components/SentimentIndicator";
import { strings, t } from "../../i18n/strings";
import type { EmotionalState, StressLevel } from "@/lib/sentiment-analysis";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
  timestamp: number;
  fullContent?: string;
}

interface SentimentData {
  emotionalState: EmotionalState;
  stressLevel: StressLevel;
  suggestedTone: string;
  trend: 'improving' | 'worsening' | 'stable';
}

interface ConversationResponse {
  answer: string;
  suggestions: string[];
  sentiment?: SentimentData;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style: number;
  };
  crisisNotice?: string;
}

type SpeechRecognition = any;

export default function GuidePage() {
  const { language, countryCode, playbackRate, voicePreference } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [autoListenAfterResponse, setAutoListenAfterResponse] = useState(true);

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
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [crisisNotice, setCrisisNotice] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<ConversationResponse['voiceSettings'] | null>(null);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastSpokenAssistantRef = useRef<string | null>(null);
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);

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
          voiceSettings, // Pass sentiment-aware voice settings
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
        // Auto-resume listening for continuous conversation
        if (autoListenAfterResponse && isVoiceActive) {
          setTimeout(() => {
            handleMicClick();
          }, 800); // Brief pause before listening again
        }
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
          sessionId, // Pass session ID for emotional journey tracking
          voiceMode: isVoiceActive, // Request brief responses when in voice mode
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
      
      // Update sentiment data
      if (data.sentiment) {
        setSentiment(data.sentiment);
      }
      
      // Update voice settings for adaptive tone
      if (data.voiceSettings) {
        setVoiceSettings(data.voiceSettings);
      }
      
      // Show crisis notice if present
      if (data.crisisNotice) {
        setCrisisNotice(data.crisisNotice);
      }
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
          
          // Clear previous auto-send timer
          if (autoSendTimerRef.current) {
            clearTimeout(autoSendTimerRef.current);
          }
          
          // Auto-send after 1.5 seconds of silence
          autoSendTimerRef.current = setTimeout(() => {
            if (combined.trim() && isVoiceActive) {
              recognition.stop();
              void sendMessage(combined);
            }
          }, 1500);
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
    <main className="mx-auto flex h-screen max-w-2xl flex-col bg-[#F9F9F9] px-6 py-6">
      <header className="flex-shrink-0 space-y-3 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
              {t(strings.guide.title, language)}
            </h1>
            <p className="text-sm text-stone-600 mt-1 flex items-center gap-2">
              {isVoiceActive 
                ? (isListening 
                  ? <><Mic className="w-4 h-4 text-emerald-600 animate-pulse" /> {language === "fr" ? "Je vous écoute..." : "Listening..."}</>
                  : (isPlaying 
                    ? <><Volume2 className="w-4 h-4 text-emerald-600" /> {language === "fr" ? "Je réponds..." : "Speaking..."}</>
                    : <><Pause className="w-4 h-4 text-stone-400" /> {language === "fr" ? "En pause" : "Paused"}</>))
                : t(strings.guide.intro, language)
              }
            </p>
          </div>
          {!isVoiceActive && (
            <button
              onClick={() => {
                setIsVoiceActive(true);
                setTimeout(() => handleMicClick(), 500);
              }}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-all flex-shrink-0 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {language === "fr" ? "Parler" : "Start"}
            </button>
          )}
        </div>
      </header>

      <ErrorBoundary>
        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg min-h-0">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 bg-stone-50">
            <span className="text-xs font-medium text-stone-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {language === "fr" ? "Conversation" : "Conversation"}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              {loading
                ? language === "fr"
                  ? "Réflexion…"
                  : "Thinking…"
                : language === "fr"
                ? "En ligne"
                : "Online"}
            </span>
          </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
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
                      ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-[#F9F9F9] border border-[#222222]/10 px-4 py-3 text-[#222222] shadow-sm"
                      : "max-w-[85%] rounded-2xl rounded-tr-sm bg-[#008080] px-4 py-3 text-white shadow-sm"
                  }
                >
                  {m.role === "assistant" ? (
                    <div className="text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1.5 mt-2 first:mt-0">{children}</h3>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          ul: ({ children }) => <ul className="ml-4 mb-2 list-disc text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="ml-4 mb-2 list-decimal text-sm">{children}</ol>,
                          li: ({ children }) => <li className="mb-0.5 leading-relaxed">{children}</li>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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
                        className="text-[11px] text-[#008080] hover:text-[#006666]"
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
            <div className="rounded-xl border border-[#E63946] bg-[#E63946]/10 px-4 py-3 text-sm text-[#E63946]">
              {error}
            </div>
          )}

          {crisisNotice && (
            <div className="rounded-xl border border-[#E63946] bg-[#E63946]/10 px-4 py-3 text-sm text-[#E63946] font-medium">
              ⚠️ {crisisNotice}
            </div>
          )}

          {sentiment && (
            <SentimentIndicator
              emotionalState={sentiment.emotionalState}
              stressLevel={sentiment.stressLevel}
              trend={sentiment.trend}
              language={language}
              compact={true}
            />
          )}

          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-semibold text-[#555555] uppercase tracking-wide">
                {t(strings.guide.examplesTitle, language)}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="rounded-full border border-[#F4D35E]/50 bg-[#F4D35E]/10 px-3 py-1 text-[10px] text-[#222222] hover:bg-[#F4D35E]/20 hover:border-[#F4D35E]"
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
          className="flex items-end gap-3 border-t border-[#222222]/10 bg-[#F9F9F9] px-4 py-3"
        >
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isPlaying}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
              isListening
                ? 'border-[#008080] bg-[#008080] text-white scale-105 shadow-md'
                : 'border-[#008080] bg-white text-[#008080] hover:bg-[#008080]/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {/* Listening pulse animation */}
            {isListening && (
              <>
                <span className="absolute -inset-2 rounded-full border-2 border-[#008080]/40 animate-ping" />
                <span className="absolute -inset-3 rounded-full border border-[#008080]/20 animate-pulse" />
              </>
            )}
            <Mic className={`relative z-10 w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
          <div className="flex-1 rounded-full border border-[#222222]/20 bg-white px-3 py-1.5 text-[11px] text-[#222222]">
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
                className="w-full bg-transparent text-[11px] text-[#222222] outline-none placeholder:text-[#555555]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 items-center justify-center rounded-full bg-[#008080] px-3 text-[11px] font-semibold text-white disabled:opacity-60 hover:bg-[#006666]"
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#222222]/20 bg-white text-[11px] text-[#555555] disabled:opacity-60 hover:bg-[#F9F9F9]"
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
      </ErrorBoundary>
    </main>
  );
}