"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../app/settings-provider";
// Removed unused imports

interface GuideVoiceAgentProps {
  onFallback: () => void; // Switch to text if voice unavailable
}

export default function GuideVoiceAgent({ onFallback }: GuideVoiceAgentProps) {
  const { language, countryCode, discreetMode } = useSettings();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [conversationMessages, setConversationMessages] = useState<
    Array<{ role: "user" | "agent"; text: string }>
  >([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError(language === "fr" ? "Microphone non disponible. Utilisez le texte." : "Microphone unavailable. Using text instead.");
      setTimeout(() => onFallback(), 1500);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language === "fr" ? "fr-FR" : "en-US";
    recognition.continuous = false; // Single utterance per recognition
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      setError(`Voice error: ${event?.error || event}`);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => (prev ? prev + " " + t : t));
          // final result -> handle
          handleUserInput(t);
        } else {
          interim += t;
        }
      }
      if (interim) setTranscript(interim);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
    // handleUserInput intentionally not included here because it's declared below
    // and we only want to initialize recognition when language or onFallback changes
  }, [language, onFallback]);

  // Speak response using ElevenLabs TTS
  const speakResponse = useCallback(async (text: string) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language, voiceId: language === "fr" ? process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_FR : process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_EN, discreetMode }),
      });

      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      await a.play();
    } catch (e) {
      console.error("TTS error:", e);
    }
  }, [language, discreetMode]);

  // Handle user voice input: send to Gemini for health guidance
  const handleUserInput = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const updated: Array<{ role: "user" | "agent"; text: string }> = [...conversationMessages, { role: "user", text: userInput }];
      setConversationMessages(updated);
      setTranscript("");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ 
            role: m.role === "user" ? "user" : "assistant", 
            content: m.text 
          })),
          language,
          voiceMode: true,
        }),
      });

      if (!res.ok) throw new Error("Agent response failed");
      const data = await res.json();
      const agentText = data.answer || "";

      setConversationMessages((prev) => [...prev, { role: "agent", text: agentText }]);
      await speakResponse(agentText);

      // resume listening
      if (recognitionRef.current) {
        setTimeout(() => recognitionRef.current.start(), 500);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsProcessing(false);
    }
  }, [language, countryCode, discreetMode, conversationMessages, speakResponse]);

  const startVoiceConversation = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setConversationMessages([]);
      recognitionRef.current.start();
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-indigo-900 bg-indigo-950 px-4 py-4 text-xs text-indigo-100">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
        🎤 {language === "fr" ? "Guide de Santé — Mode Vocal" : "Health Guide — Voice Mode"}
      </p>

      {error ? (
        <div className="rounded-lg bg-indigo-900/50 px-3 py-2 text-[11px] text-indigo-200">
          {error}
          <button onClick={onFallback} className="mt-2 block w-full rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-indigo-700">
            {language === "fr" ? "Utiliser le texte" : "Use text instead"}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {conversationMessages.length === 0 && !isListening && (
              <button onClick={startVoiceConversation} className="w-full rounded-lg bg-indigo-500 px-3 py-2 text-[11px] font-semibold text-white hover:bg-indigo-600 transition">
                🎤 {language === "fr" ? "Commencer une question" : "Ask a question"}
              </button>
            )}

            {isListening && (
              <div className="animate-pulse rounded-lg bg-indigo-900/50 px-3 py-2 text-center text-[11px] text-indigo-100">
                {language === "fr" ? "En écoute..." : "Listening..."}
              </div>
            )}

            {conversationMessages.map((msg, idx) => (
              <div key={idx} className={`rounded-lg px-3 py-2 text-[11px] ${msg.role === "user" ? "bg-indigo-900/30 text-indigo-50" : "bg-indigo-900/20 border border-indigo-700 text-indigo-50"}`}>
                <p className="font-semibold">{msg.role === "user" ? (language === "fr" ? "Vous:" : "You:") : (language === "fr" ? "Guide:" : "Guide:")}</p>
                <p className="mt-1">{msg.text}</p>
              </div>
            ))}

            {isProcessing && (
              <div className="animate-pulse rounded-lg bg-indigo-900/50 px-3 py-2 text-[11px] text-indigo-100">{language === "fr" ? "Traitement..." : "Processing..."}</div>
            )}

            {transcript && (
              <div className="rounded-lg bg-indigo-900/50 px-3 py-2 text-[11px] text-indigo-100"><p className="italic">{language === "fr" ? "Vous disiez:" : "You said:"} {transcript}</p></div>
            )}
          </div>

          {conversationMessages.length > 0 && (
            <div className="space-y-2">
              <button onClick={() => recognitionRef.current && recognitionRef.current.start()} disabled={isProcessing || isListening} className="w-full rounded-lg bg-indigo-500 px-3 py-1 text-[10px] font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 transition">{language === "fr" ? "Nouvelle question" : "Ask another question"}</button>
              <button onClick={onFallback} className="w-full rounded-lg border border-indigo-700 bg-indigo-950 px-3 py-1 text-[10px] font-semibold text-indigo-200 hover:bg-indigo-900/50">{language === "fr" ? "Préférer le texte" : "Prefer text"}</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
