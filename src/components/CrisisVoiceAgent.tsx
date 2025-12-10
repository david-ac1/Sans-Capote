"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSettings } from "../app/settings-provider";
import { getCrisisCounselorPrompt, getDiscreetModePrompt, extractTriageData } from "../lib/agentPrompts";
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

type QuestionItem = {
  key: string;
  en: string;
  fr: string;
  contextEn?: string;
  contextFr?: string;
  condition?: (answers: Record<string, string>) => boolean;
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
  const [activeQuestions, setActiveQuestions] = useState<QuestionItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCompleteCallbackRef = useRef<(() => void) | null>(null);
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
    { 
      key: "location", 
      en: "Where are you right now? City or area is fine.", 
      fr: "Où êtes-vous en ce moment ? Ville ou quartier suffisent.",
      contextEn: "This helps me find nearby clinics for you.",
      contextFr: "Cela m'aide à trouver des cliniques à proximité.",
    },
    { 
      key: "timeSince", 
      en: "How long ago did the exposure happen? Please answer in hours or days.", 
      fr: "Il y a combien de temps l'exposition a-t-elle eu lieu ? Répondez en heures ou en jours.",
      contextEn: "This is critical for determining if PEP is still an option. PEP is most effective within 24-36 hours.",
      contextFr: "C'est crucial pour déterminer si la PEP est encore possible. La PEP est plus efficace dans les 24-36 heures.",
    },
    { 
      key: "exposureType", 
      en: "What type of exposure occurred? Vaginal, anal, oral, or needle-related?", 
      fr: "Quel type d'exposition s'est produit ? Vaginal, anal, oral ou lié à une aiguille ?",
      contextEn: "Different exposures have different risk levels.",
      contextFr: "Différentes expositions ont différents niveaux de risque.",
    },
    { 
      key: "condomUsed", 
      en: "Was a condom used? If yes, did it break or slip off?", 
      fr: "Un préservatif a-t-il été utilisé ? Si oui, s'est-il cassé ou glissé ?",
    },
    { 
      key: "onPrep", 
      en: "Are you currently on PrEP? PrEP is a daily pill that prevents HIV infection.", 
      fr: "Êtes-vous actuellement sous PrEP ? La PrEP est une pilule quotidienne qui prévient l'infection VIH.",
    },
    { 
      key: "knownStatus", 
      en: "Do you know your partner's HIV status?", 
      fr: "Connaissez-vous le statut VIH de votre partenaire ?",
    },
    // Follow-up questions (added dynamically based on answers)
    { 
      key: "partnerStatusDetail", 
      en: "Is your partner HIV positive or HIV negative?", 
      fr: "Votre partenaire est-il séropositif ou séronégatif au VIH ?",
      condition: (answers: Record<string, string>) => {
        const status = answers.knownStatus?.toLowerCase() || "";
        return status.includes("yes") || status.includes("oui");
      },
    },
    { 
      key: "partnerTreatment", 
      en: "Is your partner on HIV treatment with an undetectable viral load? Undetectable means they cannot transmit HIV.", 
      fr: "Votre partenaire est-il sous traitement VIH avec une charge virale indétectable ? Indétectable signifie qu'il ne peut pas transmettre le VIH.",
      condition: (answers: Record<string, string>) => {
        const partnerStatus = answers.partnerStatusDetail?.toLowerCase() || "";
        return partnerStatus.includes("positive") || partnerStatus.includes("positif");
      },
    },
    { 
      key: "sexualRole", 
      en: "Were you the insertive or receptive partner during intercourse? In other words, were you giving or receiving?", 
      fr: "Étiez-vous le partenaire insertif ou réceptif pendant les rapports ? En d'autres termes, donniez-vous ou receviez-vous ?",
      condition: (answers: Record<string, string>) => {
        const exposure = answers.exposureType?.toLowerCase() || "";
        return exposure.includes("anal") || exposure.includes("vaginal");
      },
    },
    { 
      key: "identityAndWork", 
      en: "Do you identify as LGBTQIA+ or work in sex work? This helps us give safer, more appropriate referrals. Your answer is completely confidential.", 
      fr: "Vous identifiez-vous comme LGBTQIA+ ou travaillez-vous dans le sexe ? Cela aide pour des orientations plus sûres. Votre réponse est complètement confidentielle.",
      contextEn: "We want to connect you with affirming, safe services.",
      contextFr: "Nous voulons vous connecter à des services sûrs et affirmatifs.",
    },
    { 
      key: "stiSymptoms", 
      en: "Do you have any symptoms like discharge, sores, pain, or burning? STIs can increase HIV transmission risk.", 
      fr: "Avez-vous des symptômes comme des écoulements, des plaies, des douleurs ou des brûlures ? Les IST peuvent augmenter le risque de transmission du VIH.",
    },
    { 
      key: "injury", 
      en: "Are you injured or bleeding right now? Any trauma during the exposure?", 
      fr: "Êtes-vous blessé·e ou avez-vous des saignements en ce moment ? Un traumatisme pendant l'exposition ?",
    },
    { 
      key: "danger", 
      en: "Are you currently in immediate danger or being threatened?", 
      fr: "Êtes-vous actuellement en danger immédiat ou menacé·e ?",
    },
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
        console.log('TTS skipped: window unavailable or not mounted');
        if (onComplete) onComplete();
        resolve();
        return;
      }

      console.log('TTS speaking:', { text: text.substring(0, 50) + '...', language });

      trackVoiceFlowEvent('tts_played', {
        questionIndex,
        language,
      });

      // Set live caption (will stay visible if TTS fails)
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
          console.log('TTS blob received:', blob.size, 'bytes', blob.type);

          const url = URL.createObjectURL(blob);
          const audio = new Audio();
          audio.preload = 'auto';
          currentAudioRef.current = audio;
          
          let hasCompleted = false;
          const completeOnce = () => {
            if (hasCompleted) return;
            hasCompleted = true;
            currentAudioRef.current = null; // Clear ref
            audioCompleteCallbackRef.current = null; // Clear callback ref
            URL.revokeObjectURL(url); // Clean up blob URL
            setCurrentCaption(""); // Clear caption
            if (onComplete) onComplete();
            resolve();
          };
          
          // Store callback for Skip button
          audioCompleteCallbackRef.current = completeOnce;
          
          audio.onended = completeOnce;
          
          audio.onerror = (event) => {
            const target = event && typeof event === 'object' && 'target' in event ? (event.target as HTMLAudioElement) : null;
            const error = target?.error;
            const errorInfo = {
              code: error?.code,
              message: error?.message,
              mediaError: error ? `MEDIA_ERR_${['ABORTED', 'NETWORK', 'DECODE', 'SRC_NOT_SUPPORTED'][error.code - 1]}` : 'unknown',
              blobSize: blob.size,
              blobType: blob.type,
            };
            console.error("Audio playback error:", errorInfo);
            
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
          
          console.log('Attempting to play audio...');
          
          // Safari autoplay policy: try unmuted first, fallback to muted, then show message
          audio.play().then(() => {
            console.log('Audio playing successfully');
          }).catch(async (err) => {
            console.warn("Audio play blocked:", err.name);
            
            // Try muted autoplay (Safari allows this)
            try {
              audio.muted = true;
              await audio.play();
              
              console.log('Playing muted - prompting user to unmute');
              
              // Show message to unmute
              const unmute = confirm(
                language === 'fr'
                  ? 'Votre navigateur bloque l\'audio. Cliquez OK pour activer le son.'
                  : 'Your browser blocked audio. Click OK to enable sound.'
              );
              
              if (unmute) {
                audio.muted = false;
              }
            } catch (mutedErr) {
              console.error("Muted play also blocked:", mutedErr);
              trackError(err, {
                context: 'audio_play_safari_blocked',
                questionIndex,
                language,
              });
              completeOnce();
            }
          });
        })
        .catch(err => {
          // Handle rate limiting specifically
          if (err.message === 'RATE_LIMIT_EXCEEDED') {
            console.warn("⚠️ TTS rate limit reached - showing text instead");
            
            // Show user-friendly message
            const rateLimitMsg = language === 'fr'
              ? '(Audio temporairement indisponible - veuillez lire le texte)'
              : '(Audio temporarily unavailable - please read the text)';
            
            setCurrentCaption(`${text}\n\n${rateLimitMsg}`);
            
            trackError(err, {
              context: 'tts_rate_limit',
              questionIndex,
              language,
            });
          } else {
            console.warn("TTS unavailable, continuing with text-only:", err.message);
            trackError(err, {
              context: 'tts_fetch',
              questionIndex,
              language,
              errorMessage: err.message,
            });
          }
          
          // Keep caption visible briefly for reading, then auto-proceed to enable voice input
          setTimeout(() => {
            setCurrentCaption("");
            if (onComplete) onComplete(); // This will start voice recognition
            resolve();
          }, 1500); // Give 1.5 seconds to read, then start listening immediately
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
    const q = activeQuestions[idx];
    if (!q) return;
    setTranscript("");
    
    trackVoiceFlowEvent('question_asked', {
      questionIndex: idx,
      totalQuestions: activeQuestions.length,
      language,
    });
    
    // Build question text with optional context
    let questionText = language === "fr" ? q.fr : q.en;
    const context = language === "fr" ? q.contextFr : q.contextEn;
    
    // Add context explanation if provided
    if (context) {
      questionText = `${context} ${questionText}`;
    }
    
    speakResponse(questionText, () => {
      // start listening immediately after TTS completes
      setTimeout(() => {
        if (recognitionRef.current && !isListening) {
          try {
            setIsListening(true);
            recognitionRef.current.start();
          } catch (e) {
            console.warn("Recognition start error:", e);
            // If already started, that's fine - user might have clicked manually
          }
        }
      }, 100); // Reduced timeout for faster response
    });
  }, [language, activeQuestions, speakResponse]);

  const performFinalization = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Build structured summary with extracted triage data
      const summaryLines: string[] = [];
      for (const q of activeQuestions) {
        summaryLines.push(`${q.key}: ${answers[q.key] ?? "(no answer)"}`);
      }
      const conversationSummary = summaryLines.join("\n");
      
      // Extract and analyze triage data using improved extraction
      const triageData = extractTriageData(conversationSummary);
      
      // Calculate remaining PEP window
      let pepWindowMessage = "";
      let urgencyLevel = "";
      if (triageData.hoursAgo !== null) {
        const hoursRemaining = 72 - triageData.hoursAgo;
        if (hoursRemaining > 0) {
          if (triageData.hoursAgo < 24) {
            urgencyLevel = language === "fr" ? "⚠️ URGENCE CRITIQUE" : "⚠️ CRITICAL URGENCY";
          } else if (triageData.hoursAgo < 48) {
            urgencyLevel = language === "fr" ? "⚠️ URGENCE ÉLEVÉE" : "⚠️ HIGH URGENCY";
          } else {
            urgencyLevel = language === "fr" ? "⚠️ DERNIÈRE FENÊTRE" : "⚠️ LAST WINDOW";
          }
          
          pepWindowMessage = language === "fr"
            ? `${urgencyLevel}: Il vous reste ${hoursRemaining} heures pour accéder à la PEP (idéalement dans les prochaines heures).`
            : `${urgencyLevel}: You have ${hoursRemaining} hours remaining to access PEP (ideally within the next few hours).`;
        } else {
          pepWindowMessage = language === "fr"
            ? "La fenêtre PEP de 72 heures est fermée. Un dépistage VIH est recommandé dans 6 semaines (test rapide) ou 3 mois (confirmation)."
            : "The 72-hour PEP window has closed. HIV testing is recommended in 6 weeks (rapid test) or 3 months (confirmation).";
        }
      }

      // Filter clinics more intelligently based on PEP availability and user context
      const localMatches = servicesDirectory
        .filter((s) => {
          if (s.country !== countryCode) return false;
          
          // If LGBTQIA+ identified, prefer LGBTQIA+-friendly services
          if (triageData.lgbtqiaPlus && s.lgbtqiaFriendly && s.lgbtqiaFriendly >= 3) return true;
          
          // Prioritize clinics with verified PEP availability
          if (s.services.pep) return true;
          
          // Include hospitals and emergency centers
          if (s.name.toLowerCase().includes('hospital') || 
              s.name.toLowerCase().includes('emergency') ||
              s.name.toLowerCase().includes('hôpital') ||
              s.name.toLowerCase().includes('urgence')) {
            return true;
          }
          return false;
        })
        .sort((a, b) => {
          // Prioritize LGBTQIA+-friendly for LGBTQIA+ users
          if (triageData.lgbtqiaPlus) {
            const aFriendly = (a.lgbtqiaFriendly || 0) >= 3;
            const bFriendly = (b.lgbtqiaFriendly || 0) >= 3;
            if (aFriendly && !bFriendly) return -1;
            if (!aFriendly && bFriendly) return 1;
          }
          
          // Sort by PEP certainty and availability
          if (a.services.pep && !b.services.pep) return -1;
          if (!a.services.pep && b.services.pep) return 1;
          
          // Prefer 24/7 services in crisis
          const a24 = a.hours?.toLowerCase().includes('24') || false;
          const b24 = b.hours?.toLowerCase().includes('24') || false;
          if (a24 && !b24) return -1;
          if (!a24 && b24) return 1;
          
          return 0;
        })
        .slice(0, 5);

      // Enhanced system prompt with structured medical guidance
      const prompt = getCrisisCounselorPrompt(language, countryCode);
      const systemPrompt = discreetMode ? getDiscreetModePrompt(prompt.systemPrompt, language) : prompt.systemPrompt;

      // Create detailed context for Gemini with all triage information
      const structuredContext = `
COMPREHENSIVE TRIAGE ASSESSMENT:

TIME CRITICAL INFORMATION:
- Time since exposure: ${triageData.hoursAgo || 'unknown'} hours (${triageData.timeSince || 'unknown'} window)
- PEP window status: ${pepWindowMessage}

EXPOSURE DETAILS:
- Exposure type: ${triageData.exposureType || 'unknown'}
- Condom used: ${triageData.condomUsed || 'unknown'}
- Sexual role: ${triageData.sexualRole || 'not specified'}

PROTECTION STATUS:
- On PrEP: ${triageData.onPrep || 'unknown'}
- Partner HIV status: ${triageData.partnerStatus || 'unknown'}
- Partner on treatment: ${triageData.partnerOnTreatment || 'not applicable'}

RISK MODIFIERS:
- Risk level (preliminary): ${triageData.riskLevel || 'assess based on details'}
- LGBTQIA+ identified: ${triageData.lgbtqiaPlus ? 'yes' : 'no'}
- STI symptoms present: ${triageData.stiSymptoms ? 'yes' : 'no'}
- Physical injury/bleeding: ${triageData.hasInjury ? 'yes' : 'no'}

CLIENT RESPONSES (verbatim):
${conversationSummary}

AVAILABLE CLINICS (verified ${countryCode} resources):
${localMatches.map(s => `- ${s.name} (${s.city}): ${s.phone || 'no phone listed'}${s.hours?.toLowerCase().includes('24') ? ' [24/7]' : ''}${(s.lgbtqiaFriendly || 0) >= 3 ? ' [LGBTQIA+ friendly]' : ''}${s.services.pep ? ' [PEP available]' : ''}`).join('\n')}

INSTRUCTIONS FOR RESPONSE:
1. Provide **Risk Assessment** with clear stratification (high/moderate/low/none) and explanation
2. State **Urgency Level** with specific hours remaining for PEP if applicable
3. Explain WHY this risk level (reference specific factors: exposure type, protection used, etc.)
4. Give **Recommended Actions** as numbered, actionable steps
5. Recommend top 2-3 clinics with phone numbers from list above
6. If <24h: Include emergency hotline urgency
7. If STI symptoms: Mention testing for STIs alongside HIV concerns
8. If LGBTQIA+: Ensure recommendations include affirming services
9. Briefly explain PEP (what it is, how it works) if in window
10. Mention app resources: "Find more info in 'Services Navigator' or 'Education Hub'"

Use empathetic, non-judgmental language. Format with markdown sections.
`;

      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: structuredContext },
          ],
          language,
          voiceMode: false,
          countryCode,
          mode: "crisis_triage",
          crisisContext: {
            timeSince: triageData.timeSince,
            exposureType: triageData.exposureType,
            condomUsed: triageData.condomUsed,
            onPrep: triageData.onPrep,
            riskLevel: triageData.riskLevel,
            partnerStatus: triageData.partnerStatus,
            partnerOnTreatment: triageData.partnerOnTreatment,
            sexualRole: triageData.sexualRole,
            lgbtqiaPlus: triageData.lgbtqiaPlus,
            stiSymptoms: triageData.stiSymptoms,
            hasInjury: triageData.hasInjury,
            hoursAgo: triageData.hoursAgo,
            urgencyLevel,
            pepWindowMessage,
          },
          localServices: localMatches.map((s) => ({ 
            id: s.id, 
            name: s.name, 
            city: s.city, 
            phone: s.phone,
            hours: s.hours,
            hours24: s.hours?.toLowerCase().includes('24') || false,
            lgbtqiaFriendly: (s.lgbtqiaFriendly || 0) >= 3,
            pepAvailable: s.services.pep || false,
            prepAvailable: s.services.prep || false,
            testingAvailable: s.services.hivTesting || false,
            notes: language === "fr" ? s.notesFr : s.notesEn 
          })),
        }),
      });

      let agentText = "";
      if (res.ok) {
        const data = await res.json();
        agentText = data.answer || data.summary || "";
        
        // Prepend urgency message if PEP window active
        if (urgencyLevel && triageData.hoursAgo !== null && triageData.hoursAgo < 72) {
          agentText = pepWindowMessage + "\n\n" + agentText;
        }
      } else {
        // Enhanced fallback with specific guidance
        if (triageData.hoursAgo !== null && triageData.hoursAgo < 72) {
          agentText = language === "fr"
            ? `${pepWindowMessage}\n\nVeuillez vous rendre à la clinique la plus proche immédiatement pour évaluation PEP. Plus tôt vous commencez, meilleure est l'efficacité. La PEP est un traitement de 28 jours qui peut prévenir l'infection VIH si commencé rapidement.`
            : `${pepWindowMessage}\n\nPlease go to the nearest clinic immediately for PEP evaluation. The sooner you start, the better the effectiveness. PEP is a 28-day treatment that can prevent HIV infection if started quickly.`;
        } else {
          agentText = language === "fr"
            ? "Impossible de contacter le service d'IA. Veuillez consulter les cliniques listées ci-dessous pour une évaluation. N'hésitez pas à appeler pour des informations."
            : "Unable to reach AI service. Please consult the clinics listed below for evaluation. Don't hesitate to call for information.";
        }
      }

      const safetyNotice = language === "fr" 
        ? "🔒 Rappel : Cette conversation est privée et confidentielle. Si vous êtes en danger immédiat, appelez les services d'urgence locaux." 
        : "🔒 Reminder: This conversation is private and confidential. If you are in immediate danger, call your local emergency services.";

      // Speak final guidance
      await speakResponse(agentText + " " + safetyNotice);

      trackVoiceFlowEvent('flow_completed', {
        duration: getTelemetry().getSessionSummary().duration,
        totalQuestions: activeQuestions.length,
        language,
        country: countryCode,
      });
      
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
  }, [answers, countryCode, discreetMode, language, onComplete, activeQuestions, speakResponse, questionIndex]);

  // called when recognition yields a final answer
  const handleAnswer = useCallback((text: string) => {
    const q = activeQuestions[questionIndex];
    if (!q) return;

    trackVoiceFlowEvent('answer_received', {
      questionIndex,
      totalQuestions: activeQuestions.length,
      language,
    });

    // store answer
    const updatedAnswers = { ...answers, [q.key]: text.trim() };
    setAnswers(updatedAnswers);
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

    // Update active questions based on new answers
    const newActiveQuestions = questions.filter(question => {
      // Keep questions without conditions
      if (!question.condition) return true;
      // Check if condition is met
      return question.condition(updatedAnswers);
    });
    
    // Only update if changed to avoid infinite loops
    if (newActiveQuestions.length !== activeQuestions.length) {
      setActiveQuestions(newActiveQuestions);
    }

    // advance to next with acknowledgment
    const next = questionIndex + 1;
    if (next < newActiveQuestions.length) {
      setQuestionIndex(next);
      // Add brief acknowledgment before next question
      const acknowledgments = language === "fr" 
        ? ["D'accord.", "Merci.", "Compris.", "Je vois.", "Très bien."]
        : ["Okay.", "Thank you.", "Got it.", "I see.", "Alright."];
      const ack = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
      speakResponse(ack, () => {
        setTimeout(() => askQuestion(next), 300);
      });
    } else {
      // finished collecting answers with final acknowledgment
      const finalAck = language === "fr" 
        ? "Merci pour ces informations. Laissez-moi analyser votre situation."
        : "Thank you for that information. Let me assess your situation.";
      speakResponse(finalAck, () => {
        setTimeout(() => performFinalization(), 500);
      });
    }
  }, [questionIndex, activeQuestions, answers, questions, language, askQuestion, performFinalization, speakResponse]);

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
    
    // Initialize with base questions (no conditions yet)
    const initialQuestions = questions.filter(q => !q.condition);
    setActiveQuestions(initialQuestions);
    
    // Privacy reminder + welcoming introduction
    const intro = language === "fr"
      ? "Cette conversation est complètement privée et confidentielle. Aucune de vos réponses n'est enregistrée. Bonjour, je suis là pour vous aider. Je vais vous poser quelques questions rapides pour évaluer votre situation. Commençons."
      : "This conversation is completely private and confidential. None of your answers are stored. Hello, I'm here to help you. I'll ask you a few quick questions to assess your situation. Let's begin.";
    
    speakResponse(intro, () => {
      setTimeout(() => askQuestion(0), 500);
    });
  }, [askQuestion, language, speakResponse, questions]);

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
        <h2 className="text-base font-bold text-[#E63946] uppercase tracking-wide">{language === "fr" ? "Urgence — Consultation" : "Crisis Assessment"}</h2>
        {userStarted && (
          <div 
            className="rounded-full bg-[#E63946] px-3 py-1 text-xs font-bold text-white"
            role="status"
            aria-label={language === "fr" ? `Question ${questionIndex + 1} sur ${activeQuestions.length}` : `Question ${questionIndex + 1} of ${activeQuestions.length}`}
          >
            {questionIndex + 1}/{activeQuestions.length}
          </div>
        )}
      </div>
      
      {userStarted && error && error.includes('TTS') && (
        <div className="rounded-lg bg-[#FFF3CD] px-4 py-2 text-xs text-[#856404] border border-[#FFE69C]">
          ℹ️ {language === "fr" ? "Mode texte activé (audio indisponible)" : "Text mode active (audio unavailable)"}
        </div>
      )}
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
              <li>• {language === "fr" ? "Le système vous posera plusieurs questions simples" : "The system will ask you several simple questions"}</li>
              <li>• {language === "fr" ? "Parlez naturellement après chaque question" : "Speak naturally after each question"}</li>
              <li>• {language === "fr" ? "Lisez les questions à l'écran si l'audio n'est pas disponible" : "Read questions on screen if audio is unavailable"}</li>
              <li>• {language === "fr" ? "Faites une pause quand vous avez terminé" : "Pause when you're done speaking"}</li>
              <li>• {language === "fr" ? "Durée estimée : 3-5 minutes" : "Estimated time: 3-5 minutes"}</li>
            </ul>
          </div>
          <div className="rounded-lg bg-[#E3F4F4] px-5 py-4">
            <h3 className="font-bold text-sm text-[#008080] mb-2">🔒 {language === "fr" ? "Confidentialité totale" : "Complete Privacy"}</h3>
            <p className="text-sm text-[#555555]">{language === "fr" ? "Cette conversation est privée et sans jugement. Aucune réponse n'est enregistrée." : "This conversation is private and stigma-free. No answers are stored."}</p>
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
              <div className="flex items-center gap-2">
                <div className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                  isListening ? 'bg-[#E63946] text-white' : 'bg-white text-[#555555] border border-[#222222]/10'
                }`}>
                  {isListening ? (language === "fr" ? 'En écoute' : 'Listening') : (language === "fr" ? 'En attente' : 'Waiting')}
                </div>
                {/* Skip audio button - shows when audio is playing */}
                {!isListening && !isProcessing && currentCaption && questionIndex < activeQuestions.length && (
                  <button
                    onClick={() => {
                      // Stop current audio if playing
                      if (currentAudioRef.current) {
                        currentAudioRef.current.pause();
                        currentAudioRef.current.src = '';
                        currentAudioRef.current = null;
                      }
                      
                      // Clear caption
                      setCurrentCaption("");
                      
                      // Call the complete callback to proceed
                      if (audioCompleteCallbackRef.current) {
                        audioCompleteCallbackRef.current();
                      }
                    }}
                    className="rounded-full px-3 py-1 text-xs font-bold bg-[#555555] text-white hover:bg-[#333333] transition-colors"
                    aria-label={language === "fr" ? "Passer l'audio" : "Skip audio"}
                  >
                    {language === "fr" ? "Passer" : "Skip"}
                  </button>
                )}
              </div>
            </div>
            <p className="text-base text-[#1a1a1a]">{activeQuestions[questionIndex] ? (language === "fr" ? activeQuestions[questionIndex].fr : activeQuestions[questionIndex].en) : (language === "fr" ? "Collecte terminée." : "Collection complete.")}</p>
          </div>

          {transcript && (
            <div className="rounded-lg bg-[#E3F4F4] px-5 py-4">
              <p className="text-xs font-bold text-[#008080] mb-2 uppercase tracking-wide">{language === "fr" ? "Votre réponse" : "Your answer"}</p>
              <p className="text-sm text-[#1a1a1a]">{transcript}</p>
            </div>
          )}

          {/* Voice input or text input controls */}
          {!isProcessing && questionIndex < activeQuestions.length && (
            <div className="space-y-3 rounded-lg bg-[#F9F9F9] px-5 py-4">
              {!isListening ? (
                <>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        // Skip audio and start listening immediately
                        if (currentAudioRef.current) {
                          currentAudioRef.current.pause();
                          currentAudioRef.current.src = '';
                        }
                        setCurrentCaption("");
                        if (recognitionRef.current) {
                          try {
                            recognitionRef.current.start();
                          } catch (e) {
                            console.warn("Recognition already started:", e);
                          }
                        }
                      }}
                      className="flex-1 rounded-lg bg-[#E63946] px-6 py-3 text-sm font-bold text-white hover:bg-[#d62839] transition-colors flex items-center justify-center gap-2"
                      aria-label={language === "fr" ? "Commencer à parler" : "Start speaking"}
                    >
                      🎤 {language === "fr" ? "Répondre vocalement" : "Speak Answer"}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-[#555555] uppercase tracking-wide text-center">
                    {language === "fr" ? "Ou tapez votre réponse" : "Or type your answer"}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && transcript.trim()) {
                          handleAnswerRef.current(transcript);
                        }
                      }}
                      placeholder={language === "fr" ? "Tapez ici..." : "Type here..."}
                      className="flex-1 rounded-lg border border-[#222222]/20 px-4 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#008080]"
                      aria-label={language === "fr" ? "Saisir la réponse" : "Enter answer"}
                    />
                    <button
                      onClick={() => {
                        if (transcript.trim()) {
                          handleAnswerRef.current(transcript);
                        }
                      }}
                      disabled={!transcript.trim()}
                      className="rounded-lg bg-[#008080] px-6 py-2 text-sm font-bold text-white hover:bg-[#007070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={language === "fr" ? "Soumettre la réponse" : "Submit answer"}
                    >
                      {language === "fr" ? "Envoyer" : "Submit"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm font-bold text-[#E63946] mb-2">
                    🎤 {language === "fr" ? "En écoute... Parlez maintenant" : "Listening... Speak now"}
                  </p>
                  <button
                    onClick={() => {
                      if (recognitionRef.current) {
                        recognitionRef.current.stop();
                      }
                    }}
                    className="rounded-lg bg-[#555555] px-4 py-2 text-xs font-bold text-white hover:bg-[#333333] transition-colors"
                  >
                    {language === "fr" ? "Arrêter l'écoute" : "Stop Listening"}
                  </button>
                </div>
              )}
            </div>
          )}

          {logEntries.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#555555] font-medium">{language === "fr" ? "Progression:" : "Progress:"}</span>
              <div className="flex gap-1.5">
                {logEntries.map((e) => (
                  <div key={e.ts} className="w-2 h-2 rounded-full bg-[#008080]" />
                ))}
                {Array.from({ length: activeQuestions.length - logEntries.length }).map((_, idx) => (
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

