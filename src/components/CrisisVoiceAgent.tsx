"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSettings } from "../app/settings-provider";
import { getCrisisCounselorPrompt, getDiscreetModePrompt } from "../lib/agentPrompts";
import { servicesDirectory, ServiceEntry } from "../data/servicesDirectory";
import { trackVoiceFlowEvent, trackError, getTelemetry } from "../lib/telemetry";
import { fetchTTSWithRetry, preloadCommonPhrases } from "../lib/tts-service";
import { LiveCaption } from "./LiveCaption";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";

export type CrisisTriageData = {
  timeSince: string | null;
  exposureType: string | null;
  condomUsed: string | null;
  onPrep: string | null;
};

interface CrisisVoiceAgentProps {
  onComplete: (result: { answer: string; safetyNotice: string; localMatches: ServiceEntry[] }) => void;
}

export default function CrisisVoiceAgent({ onComplete }: CrisisVoiceAgentProps) {
  const { language, countryCode, discreetMode } = useSettings();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [logEntries, setLogEntries] = useState<Array<{ key: string; question: string; answer: string; ts: number }>>([]);
  const [userStarted, setUserStarted] = useState(false); // require explicit gesture before audio
  const [showInstructions, setShowInstructions] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const handleAnswerRef = useRef<(text: string) => void>(() => {});

  // Keyboard navigation
  useKeyboardNavigation(containerRef, {
    onSpace: () => {
      if (userStarted && !isProcessing && !isListening && recognitionRef.current) {
        recognitionRef.current.start();
      }
    },
    onEscape: () => {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
    },
    enabled: userStarted,
  });

  // Prevent hydration errors and cleanup
  useEffect(() => {
    setIsMounted(true);
    
    // Track assessment started
    trackVoiceFlowEvent('assessment_started', {
      language,
      country: countryCode,
    });
    
    // Preload common phrases
    if (typeof window !== 'undefined') {
      preloadCommonPhrases(language);
    }
    
    return () => {
      // Cleanup on unmount
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current = null;
      }
      
      // Track abandonment if flow wasn't completed
      const summary = getTelemetry().getSessionSummary();
      if (summary.eventCount > 0 && !summary.events.includes('flow_completed')) {
        trackVoiceFlowEvent('flow_abandoned', {
          duration: summary.duration,
          questionIndex,
        });
      }
    };
  }, [language, countryCode, questionIndex]);

  const questions = useMemo(() => [
    { key: "location", en: "Where are you right now? City or area is fine.", fr: "Où êtes-vous en ce moment ? Ville ou quartier suffisent." },
    { key: "timeSince", en: "How long ago did the exposure happen? Please answer in hours or days.", fr: "Il y a combien de temps l'exposition a-t-elle eu lieu ? Répondez en heures ou en jours." },
    { key: "condomUsed", en: "Was a condom used?", fr: "Un préservatif a-t-il été utilisé ?" },
    { key: "onPrep", en: "Are you currently on PrEP?", fr: "Êtes-vous actuellement sous PrEP ?" },
    { key: "relation", en: "Was the person your partner, acquaintance, or a stranger?", fr: "La personne était-elle votre partenaire, une connaissance ou un inconnu ?" },
    { key: "knownStatus", en: "Do you know their HIV status?", fr: "Connaissez-vous leur statut VIH ?" },
    { key: "identityAndWork", en: "Do you identify as LGBTQIA+ or work in sex work? This helps us give safer referrals.", fr: "Vous identifiez-vous comme LGBTQIA+ ou travaillez-vous dans le sexe ? Cela aide pour des orientations plus sûres." },
    { key: "injury", en: "Are you injured or bleeding right now?", fr: "Êtes-vous blessé·e ou avez-vous des saignements en ce moment ?" },
    { key: "danger", en: "Are you currently in immediate danger or threatened?", fr: "Êtes-vous actuellement en danger immédiat ou menacé·e ?" },
  ], []);

  // Guardrail checks
  const checkForImmediateHarm = (text: string) => {
    const t = text.toLowerCase();
    const dangerKeywords = ["bleed", "bleeding", "hurt", "injury", "cut", "stab", "emergency", "ambulance", "hospital", "police"];
    const selfHarmKeywords = ["suicide", "kill myself", "end my life", "hurt myself", "want to die"];
    if (dangerKeywords.some((k) => t.includes(k))) return "danger";
    if (selfHarmKeywords.some((k) => t.includes(k))) return "selfharm";
    return null;
  };

  const speakResponse = useCallback((text: string, onComplete?: () => void) => {
    return new Promise<void>((resolve) => {
      // Guard against SSR and ensure mounted
      if (typeof window === "undefined" || !isMounted) {
        if (onComplete) onComplete();
        resolve();
        return;
      }

      trackVoiceFlowEvent('tts_played', {
        questionIndex,
        language,
      });

      // Set live caption
      setCurrentCaption(text);

      fetchTTSWithRetry({
        text,
        language,
        voiceId: language === "fr" 
          ? process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_FR 
          : process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_EN,
        discreetMode,
        emotionalContext: 'empathetic',
      })
        .then(blob => {

          const url = URL.createObjectURL(blob);
          const audio = new Audio();
          currentAudioRef.current = audio;
          
          let hasCompleted = false;
          const completeOnce = () => {
            if (hasCompleted) return;
            hasCompleted = true;
            URL.revokeObjectURL(url); // Clean up blob URL
            setCurrentCaption(""); // Clear caption
            if (onComplete) onComplete();
            resolve();
          };
          
          audio.onended = completeOnce;
          
          audio.onerror = (event) => {
            const target = event && typeof event === 'object' && 'target' in event ? (event.target as HTMLAudioElement) : null;
            const error = target?.error;
            const errorInfo = {
              code: error?.code,
              message: error?.message,
              mediaError: error ? `MEDIA_ERR_${['ABORTED', 'NETWORK', 'DECODE', 'SRC_NOT_SUPPORTED'][error.code - 1]}` : 'unknown'
            };
            console.warn("Audio playback issue:", errorInfo);
            
            trackVoiceFlowEvent('tts_failed', {
              questionIndex,
              language,
              errorMessage: errorInfo.mediaError,
            });
            
            completeOnce();
          };

          // Set source and play
          audio.src = url;
          audio.load();
          
          audio.play().catch(err => {
            console.warn("Audio play blocked or failed:", err.name, err.message);
            trackError(err, {
              context: 'audio_play',
              questionIndex,
              language,
            });
            completeOnce();
          });
        })
        .catch(err => {
          console.warn("TTS processing error:", err.message || err);
          trackError(err, {
            context: 'tts_fetch',
            questionIndex,
            language,
          });
          if (onComplete) onComplete();
          resolve();
        });
    });
  }, [language, discreetMode, isMounted, questionIndex]);

  // start recognition with handlers
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError(language === "fr" ? "Microphone non disponible." : "Microphone unavailable.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language === "fr" ? "fr-FR" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      trackVoiceFlowEvent('recognition_started', { questionIndex, language });
    };
    recognition.onend = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      const errorMsg = String(event?.error || event);
      setError(errorMsg);
      trackVoiceFlowEvent('recognition_failed', { 
        questionIndex, 
        language,
        errorMessage: errorMsg,
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => (prev ? prev + " " + t : t));
          // Use ref to always get the latest handleAnswer
          handleAnswerRef.current(t);
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
  }, [language, isMounted, questionIndex]);

  const askQuestion = useCallback((idx: number) => {
    const q = questions[idx];
    if (!q) return;
    setTranscript("");
    
    trackVoiceFlowEvent('question_asked', {
      questionIndex: idx,
      totalQuestions: questions.length,
      language,
    });
    
    speakResponse(language === "fr" ? q.fr : q.en, () => {
      // start listening after TTS completes
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.warn("Recognition start error:", e);
          }
        }
      }, 150);
    });
  }, [language, questions, speakResponse]);

  const performFinalization = useCallback(async () => {
    setIsProcessing(true);
    try {
      // build a human-readable summary for Gemini
      const summaryLines: string[] = [];
      for (const q of questions) {
        summaryLines.push(`${q.key}: ${answers[q.key] ?? "(no answer)"}`);
      }
      const summary = summaryLines.join("\n");

      // local matching: filter servicesDirectory by country + likely pep availability
      const localMatches = servicesDirectory.filter((s) => s.country === countryCode).slice(0, 5);

      // call Gemini backend for next steps & referrals
      const prompt = getCrisisCounselorPrompt(language, countryCode);
      const systemPrompt = discreetMode ? getDiscreetModePrompt(prompt.systemPrompt, language) : prompt.systemPrompt;

      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Client answers:\n${summary}` },
          ],
          language,
          countryCode,
          mode: "crisis_triage",
          localServices: localMatches.map((s) => ({ id: s.id, name: s.name, city: s.city, phone: s.phone, notes: language === "fr" ? s.notesFr : s.notesEn })),
        }),
      });

      let agentText = "";
      if (res.ok) {
        const data = await res.json();
        agentText = data.answer || data.summary || "";
      } else {
        agentText = language === "fr" ? "Impossible de contacter le service d'IA. Voici des étapes générales..." : "Unable to reach AI service. Here are general next steps...";
      }

      // combine with local matches into final payload
      const safetyNotice = language === "fr" ? "Si vous êtes en danger, appelez les services d'urgence locaux." : "If you are in danger, call your local emergency services.";

      // speak final guidance
      await speakResponse(agentText + " " + safetyNotice);

      trackVoiceFlowEvent('flow_completed', {
        duration: getTelemetry().getSessionSummary().duration,
        totalQuestions: questions.length,
        language,
        country: countryCode,
      });
      
      // Track referrals separately
      if (localMatches.length > 0) {
        trackVoiceFlowEvent('referral_provided', {
          country: countryCode,
        });
      }

      onComplete({ answer: agentText, safetyNotice, localMatches });
    } catch (e) {
      console.error(e);
      setError(String(e));
      trackError(e as Error, {
        context: 'finalization',
        questionIndex,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [answers, countryCode, discreetMode, language, onComplete, questions, speakResponse, questionIndex]);

  // called when recognition yields a final answer
  const handleAnswer = useCallback((text: string) => {
    const q = questions[questionIndex];
    if (!q) return;

    trackVoiceFlowEvent('answer_received', {
      questionIndex,
      totalQuestions: questions.length,
      language,
    });

    // store answer
    setAnswers((prev) => ({ ...prev, [q.key]: text.trim() }));
    setLogEntries((prev) => [...prev, { key: q.key, question: language === "fr" ? q.fr : q.en, answer: text.trim(), ts: Date.now() }]);

    // guardrails
    const harm = checkForImmediateHarm(text);
    if (harm === "danger") {
      const warning = language === "fr" ? "Si vous êtes en danger immédiat, appelez les services d'urgence locaux maintenant." : "If you are in immediate danger, call emergency services now.";
      speakResponse(warning);
      // stop the flow and surface local emergency recommendations
      performFinalization();
      return;
    }
    if (harm === "selfharm") {
      const safeMsg = language === "fr" ? "Si vous vous sentez suicidaire, contactez immédiatement les services d'urgence ou une ligne d'aide locale." : "If you are feeling suicidal, contact emergency services or a local crisis line immediately.";
      speakResponse(safeMsg);
      performFinalization();
      return;
    }

    // advance to next
    const next = questionIndex + 1;
    if (next < questions.length) {
      setQuestionIndex(next);
      setTimeout(() => askQuestion(next), 200);
    } else {
      // finished collecting answers
      performFinalization();
    }
  }, [questionIndex, questions, language, askQuestion, performFinalization, speakResponse]);

  // Update the ref whenever handleAnswer changes
  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  }, [handleAnswer]);

  // start flow on mount
  const startInterview = useCallback(() => {
    setShowInstructions(false);
    setUserStarted(true);
    setError(null);
    setQuestionIndex(0);
    setAnswers({});
    setLogEntries([]);
    // Skip intro, go directly to first question
    setTimeout(() => askQuestion(0), 300);
  }, [askQuestion]);

  if (!isMounted) {
    return (
      <section className="space-y-4 rounded-xl border border-red-900 bg-red-950 px-4 py-4 text-xs text-red-100">
        <div className="flex items-center justify-center py-8">
          <div className="text-[11px] text-red-300">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="space-y-5 rounded-lg border-2 border-[#E63946] bg-white px-6 py-6"
      role="region"
      aria-label={language === "fr" ? "Évaluation d'urgence vocale" : "Crisis voice assessment"}
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#E63946] uppercase tracking-wide">{language === "fr" ? "Urgence — Consultation vocale" : "Crisis — Voice Assessment"}</h2>
        {userStarted && (
          <div 
            className="rounded-full bg-[#E63946] px-3 py-1 text-xs font-bold text-white"
            role="status"
            aria-label={language === "fr" ? `Question ${questionIndex + 1} sur ${questions.length}` : `Question ${questionIndex + 1} of ${questions.length}`}
          >
            {questionIndex + 1}/{questions.length}
          </div>
        )}
      </div>
      {error && (
        <div 
          className="rounded-lg bg-[#FFE5E8] px-4 py-3 text-sm text-[#E63946]" 
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {!userStarted && showInstructions ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-[#F9F9F9] px-5 py-4">
            <h3 className="font-bold text-sm text-[#1a1a1a] mb-3">{language === "fr" ? "Comment ça marche" : "How it works"}</h3>
            <ul className="space-y-2 text-sm text-[#555555]">
              <li>• {language === "fr" ? "Le système vous posera 9 questions simples" : "The system will ask you 9 simple questions"}</li>
              <li>• {language === "fr" ? "Parlez naturellement après chaque question" : "Speak naturally after each question"}</li>
              <li>• {language === "fr" ? "Faites une pause quand vous avez terminé" : "Pause when you're done speaking"}</li>
              <li>• {language === "fr" ? "Le système posera automatiquement la question suivante" : "The system will automatically ask the next question"}</li>
              <li>• {language === "fr" ? "Durée estimée : 2-3 minutes" : "Estimated time: 2-3 minutes"}</li>
            </ul>
          </div>
          <div className="rounded-lg bg-[#FFE5E8] px-5 py-4">
            <h3 className="font-bold text-sm text-[#E63946] mb-2">{language === "fr" ? "Prêt·e à commencer" : "Ready to begin"}</h3>
            <p className="text-sm text-[#555555]">{language === "fr" ? "Appuyez sur Démarrer pour autoriser l'audio et commencer." : "Tap Start to enable audio and begin."}</p>
          </div>
          <button 
            onClick={startInterview} 
            className="w-full rounded-lg bg-[#E63946] px-6 py-3 text-sm font-bold text-white hover:bg-[#d62839] transition-colors"
            aria-label={language === "fr" ? "Commencer l'évaluation vocale" : "Begin voice assessment"}
          >
            {language === "fr" ? "Commencer" : "Begin"}
          </button>
          <p className="text-xs text-[#999999] text-center">
            {language === "fr" ? "Vos réponses sont utilisées uniquement pour vous orienter." : "Your responses are used only to provide guidance."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-[#F9F9F9] px-5 py-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="text-xs font-bold text-[#555555] uppercase tracking-wide">{language === "fr" ? "Question" : "Question"}</p>
              <div className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                isListening ? 'bg-[#E63946] text-white' : 'bg-white text-[#555555] border border-[#222222]/10'
              }`}>
                {isListening ? (language === "fr" ? 'En écoute' : 'Listening') : (language === "fr" ? 'En attente' : 'Waiting')}
              </div>
            </div>
            <p className="text-base text-[#1a1a1a]">{questions[questionIndex] ? (language === "fr" ? questions[questionIndex].fr : questions[questionIndex].en) : (language === "fr" ? "Collecte terminée." : "Collection complete.")}</p>
          </div>

          {transcript && (
            <div className="rounded-lg bg-[#E3F4F4] px-5 py-4">
              <p className="text-xs font-bold text-[#008080] mb-2 uppercase tracking-wide">{language === "fr" ? "Votre réponse" : "Your answer"}</p>
              <p className="text-sm text-[#1a1a1a]">{transcript}</p>
            </div>
          )}

          {logEntries.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#555555] font-medium">{language === "fr" ? "Progression:" : "Progress:"}</span>
              <div className="flex gap-1.5">
                {logEntries.map((e) => (
                  <div key={e.ts} className="w-2 h-2 rounded-full bg-[#008080]" />
                ))}
                {Array.from({ length: questions.length - logEntries.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="w-2 h-2 rounded-full bg-[#222222]/10" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Live captions for accessibility */}
      <LiveCaption 
        text={currentCaption} 
        isVisible={userStarted} 
        language={language} 
      />
    </section>
  );
}

