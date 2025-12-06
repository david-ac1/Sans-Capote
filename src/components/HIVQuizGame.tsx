'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QuizQuestion, getRandomQuestions } from '@/data/hivQuizQuestions';

interface HIVQuizGameProps {
  language: 'en' | 'fr';
  onComplete: (score: number, correctAnswers: number, totalQuestions: number) => void;
}

type GameState = 'intro' | 'playing' | 'answering' | 'result' | 'completed';

const TOTAL_QUESTIONS = 15;
const LIFELINES = {
  askAI: 1,
  skip: 1,
};

export default function HIVQuizGame({ language, onComplete }: HIVQuizGameProps) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lifelinesUsed, setLifelinesUsed] = useState({ askAI: 0, skip: 0 });
  const [aiHint, setAiHint] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 5; // Get multiple alternatives for better matching
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toUpperCase().trim();
        setTranscript(transcript);
        setIsListening(false);

        // Enhanced matching logic for better accuracy
        let detectedAnswer: 'A' | 'B' | 'C' | 'D' | null = null;
        
        // 1. Direct single letter match (most common)
        const singleLetter = transcript.match(/\b([ABCD])\b/);
        if (singleLetter) {
          detectedAnswer = singleLetter[1] as 'A' | 'B' | 'C' | 'D';
        }
        
        // 2. Phonetic matches (common misheard words)
        if (!detectedAnswer) {
          const phoneticMap: { [key: string]: 'A' | 'B' | 'C' | 'D' } = {
            // English
            'AY': 'A', 'EH': 'A', 'HEY': 'A', 'AAY': 'A',
            'BE': 'B', 'BEE': 'B', 'BEA': 'B',
            'SEE': 'C', 'SEA': 'C', 'SI': 'C',
            'DEE': 'D', 'DE': 'D', 'DI': 'D',
            // French
            'ALPHA': 'A', 'BRAVO': 'B', 'CHARLIE': 'C', 'DELTA': 'D',
          };
          
          for (const [phonetic, letter] of Object.entries(phoneticMap)) {
            if (transcript.includes(phonetic)) {
              detectedAnswer = letter;
              break;
            }
          }
        }
        
        // 3. Word matches (e.g., "ANSWER A", "OPTION B", "LETTER C")
        if (!detectedAnswer) {
          const wordMatch = transcript.match(/(?:ANSWER|OPTION|LETTER|CHOICE|RÉPONSE|LETTRE)\s*([ABCD])/);
          if (wordMatch) {
            detectedAnswer = wordMatch[1] as 'A' | 'B' | 'C' | 'D';
          }
        }
        
        // 4. Position words (e.g., "FIRST", "SECOND", "THIRD", "FOURTH")
        if (!detectedAnswer) {
          if (transcript.includes('FIRST') || transcript.includes('PREMIER') || transcript.includes('PREMIÈRE')) {
            detectedAnswer = 'A';
          } else if (transcript.includes('SECOND') || transcript.includes('DEUXIÈME') || transcript.includes('DEUX')) {
            detectedAnswer = 'B';
          } else if (transcript.includes('THIRD') || transcript.includes('TROISIÈME') || transcript.includes('TROIS')) {
            detectedAnswer = 'C';
          } else if (transcript.includes('FOURTH') || transcript.includes('QUATRIÈME') || transcript.includes('QUATRE')) {
            detectedAnswer = 'D';
          }
        }

        if (detectedAnswer) {
          handleAnswerSelect(detectedAnswer);
        } else {
          // Show helpful message if no match
          setTranscript(language === 'en' 
            ? `"${transcript}" - Please say just the letter: A, B, C, or D`
            : `"${transcript}" - Veuillez dire seulement la lettre: A, B, C ou D`
          );
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, currentQuestion]);

  // Auto-read question when it loads
  useEffect(() => {
    if (gameState === 'playing' && currentQuestion && !isSpeaking) {
      // Wait 2 seconds before reading question
      const timeout = setTimeout(() => {
        readQuestion();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [gameState, currentQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            // Auto-skip when time runs out
            if (gameState === 'playing') {
              handleAnswerSelect('A' as 'A' | 'B' | 'C' | 'D'); // Default to A if no answer
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerActive, timeLeft]);

  const startGame = () => {
    const selectedQuestions = getRandomQuestions(TOTAL_QUESTIONS, []);
    setQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setGameState('playing');
    setLifelinesUsed({ askAI: 0, skip: 0 });
    setTimeLeft(30);
    setTimerActive(false);
  };

  const speakText = async (text: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsSpeaking(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert base64 to audio blob
        const audioData = atob(data.audio);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsSpeaking(false);
          audioRef.current = null;
          URL.revokeObjectURL(audioUrl);
        };
        await audio.play();
      } else {
        console.error('TTS API error:', await response.text());
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const handleAnswerSelect = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    if (gameState !== 'playing') return;
    
    // Stop timer
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setSelectedAnswer(answer);
    setGameState('answering');
    
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      const points = currentQuestion.points;
      setScore((prev) => prev + points);
      setCorrectAnswers((prev) => prev + 1);
      
      // Celebration
      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    // Read explanation
    const explanation = language === 'en' ? currentQuestion.explanationEn : currentQuestion.explanationFr;
    setTimeout(() => speakText(explanation), 500);
  }, [gameState, currentQuestion, language]);

  const readQuestion = async () => {
    if (!currentQuestion) return;
    
    const questionText = language === 'en' ? currentQuestion.questionEn : currentQuestion.questionFr;
    const optionsText = Object.entries(currentQuestion.options)
      .map(([key, value]) => {
        const text = language === 'en' ? value.en : value.fr;
        return `${key}. ${text}`;
      })
      .join('. ');

    await speakText(`${questionText}. ${optionsText}`);
    
    // Start timer after question is read
    setTimerActive(true);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };
  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAiHint('');
    setTranscript('');
    setTimeLeft(30);
    setTimerActive(false);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setGameState('playing');
    } else {
      setGameState('completed');
      onComplete(score, correctAnswers, questions.length);
    }
  };

  const useAskAI = async () => {
    if (lifelinesUsed.askAI >= LIFELINES.askAI) return;
    
    setLifelinesUsed({ ...lifelinesUsed, askAI: lifelinesUsed.askAI + 1 });
    
    // Show loading state
    setAiHint(language === 'en' ? 'Generating hint...' : 'Génération de l\'indice...');
    
    try {
      const questionText = language === 'en' ? currentQuestion.questionEn : currentQuestion.questionFr;
      const optionsText = Object.entries(currentQuestion.options)
        .map(([key, value]) => {
          const text = language === 'en' ? value.en : value.fr;
          return `${key}. ${text}`;
        })
        .join(', ');
      
      const hintPrompt = language === 'en'
        ? `Give a brief hint (2-3 sentences max) for this HIV quiz question without directly revealing the answer. Question: ${questionText}. Options: ${optionsText}`
        : `Donnez un indice bref (2-3 phrases max) pour cette question de quiz VIH sans révéler directement la réponse. Question: ${questionText}. Options: ${optionsText}`;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: hintPrompt }
          ],
          language,
          sessionId: 'quiz-hint',
          voiceMode: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status}`, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI hint response:', data);
      
      const hint = data.answer || data.response || 'Hint unavailable';
      setAiHint(hint);
      
      // Speak the hint if voice is enabled
      if (hint && hint !== 'Hint unavailable') {
        await speakText(hint);
      }
    } catch (error) {
      console.error('AI hint error:', error);
      const errorMessage = language === 'en' 
        ? 'Sorry, I could not generate a hint at this time.'
        : 'Désolé, je n\'ai pas pu générer un indice pour le moment.';
      setAiHint(errorMessage);
    }
  };

  const useSkip = () => {
    if (lifelinesUsed.skip >= LIFELINES.skip) return;
    
    setLifelinesUsed({ ...lifelinesUsed, skip: lifelinesUsed.skip + 1 });
    nextQuestion();
  };

  if (gameState === 'intro') {
    return (
      <div className="space-y-4 rounded-xl border border-[#222222]/10 bg-white px-6 py-6 shadow-sm max-w-2xl">
        <h2 className="text-xl font-bold text-[#1a1a1a]">
          {language === 'en' ? 'HIV Knowledge Quiz' : 'Quiz de Connaissances VIH'}
        </h2>
        <p className="text-sm text-[#555555]">
          {language === 'en' 
            ? 'Test your knowledge with 15 questions about HIV, PrEP/PEP, U=U, and more!'
            : 'Testez vos connaissances avec 15 questions sur le VIH, PrEP/PEP, I=I et plus!'}
        </p>
        
        <div className="space-y-2 rounded-lg border border-[#008080]/20 bg-[#E3F4F4] px-4 py-4">
          <h3 className="text-sm font-bold text-[#008080]">
            {language === 'en' ? 'How to Play' : 'Comment Jouer'}
          </h3>
          <ul className="space-y-1.5 text-sm text-[#1a1a1a]">
            <li>• {language === 'en' ? 'AI reads each question aloud automatically' : 'L\'IA lit chaque question automatiquement'}</li>
            <li>• {language === 'en' ? 'Click "Speak Answer" and say A, B, C, or D' : 'Cliquez "Parlez" et dites A, B, C ou D'}</li>
            <li>• {language === 'en' ? '30 seconds per question (timer starts after question)' : '30 secondes par question (chrono après lecture)'}</li>
            <li>• {language === 'en' ? '2 Lifelines: Ask AI (1x), Skip (1x)' : '2 Jokers: Demander IA (1x), Passer (1x)'}</li>
            <li>• {language === 'en' ? 'Points: Easy (100), Medium (200), Hard (500)' : 'Points: Facile (100), Moyen (200), Difficile (500)'}</li>
          </ul>
        </div>

        <button
          onClick={startGame}
          className="w-full rounded-lg bg-[#008080] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#006666] transition-colors shadow-sm"
        >
          {language === 'en' ? 'Start Quiz →' : 'Commencer le Quiz →'}
        </button>
      </div>
    );
  }

  if (gameState === 'completed') {
    return null; // Parent component handles completion
  }

  if (!currentQuestion) return null;

  const questionText = language === 'en' ? currentQuestion.questionEn : currentQuestion.questionFr;
  const explanation = language === 'en' ? currentQuestion.explanationEn : currentQuestion.explanationFr;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Progress Bar & Timer */}
      <div className="rounded-lg border border-[#222222]/10 bg-white px-4 py-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1a1a1a]">
            {language === 'en' ? 'Question' : 'Question'} {currentQuestionIndex + 1}/{questions.length}
          </span>
          <div className="flex items-center gap-2">
            {timerActive && (
              <span className={`text-sm font-bold ${
                timeLeft <= 10 ? 'text-[#E63946] animate-pulse' : 'text-[#555555]'
              }`}>
                ⏱️ {timeLeft}s
              </span>
            )}
            <span className="text-base font-bold text-[#008080]">
              {score} {language === 'en' ? 'pts' : 'pts'}
            </span>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#E3F4F4]">
          <div 
            className="h-full bg-[#008080] transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Lifelines */}
      <div className="flex gap-3">
        <button
          onClick={useAskAI}
          disabled={lifelinesUsed.askAI >= LIFELINES.askAI || gameState === 'answering'}
          className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-bold transition-colors ${
            lifelinesUsed.askAI >= LIFELINES.askAI
              ? 'border-[#222222]/10 bg-[#F9F9F9] text-[#999999] cursor-not-allowed'
              : 'border-[#F4D35E] bg-[#FFF9E6] text-[#1a1a1a] hover:bg-[#FFF3D1]'
          }`}
        >
          💡 {language === 'en' ? 'Ask AI' : 'IA'} ({LIFELINES.askAI - lifelinesUsed.askAI})
        </button>
        <button
          onClick={useSkip}
          disabled={lifelinesUsed.skip >= LIFELINES.skip || gameState === 'answering'}
          className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-bold transition-colors ${
            lifelinesUsed.skip >= LIFELINES.skip
              ? 'border-[#222222]/10 bg-[#F9F9F9] text-[#999999] cursor-not-allowed'
              : 'border-[#008080]/30 bg-[#E3F4F4] text-[#008080] hover:bg-[#D1ECEC]'
          }`}
        >
          ⏭️ {language === 'en' ? 'Skip' : 'Passer'} ({LIFELINES.skip - lifelinesUsed.skip})
        </button>
      </div>

      {/* Question Card */}
      <div className="space-y-4 rounded-xl border border-[#222222]/10 bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
            currentQuestion.difficulty === 'easy' ? 'bg-[#E3F4F4] text-[#008080] border border-[#008080]/20' :
            currentQuestion.difficulty === 'medium' ? 'bg-[#FFF9E6] text-[#1a1a1a] border border-[#F4D35E]/30' :
            'bg-[#FFE5E8] text-[#E63946] border border-[#E63946]/30'
          }`}>
            {currentQuestion.points}
          </div>
          <p className="flex-1 text-base font-semibold text-[#1a1a1a] leading-relaxed">{questionText}</p>
        </div>

        {/* Status indicator */}
        {isSpeaking && (
          <div className="rounded-lg border border-[#008080]/20 bg-[#E3F4F4] px-4 py-3 text-center">
            <p className="text-sm font-semibold text-[#008080]">
              🔊 {language === 'en' ? 'AI is reading the question...' : 'L\'IA lit la question...'}
            </p>
          </div>
        )}

        {/* AI Hint */}
        {aiHint && (
          <div className="rounded-lg border border-[#F4D35E]/30 bg-[#FFF9E6] px-4 py-3">
            <p className="text-sm font-bold text-[#1a1a1a]">💡 {language === 'en' ? 'AI Hint:' : 'Indice IA:'}</p>
            <p className="text-sm text-[#555555] mt-1">{aiHint}</p>
          </div>
        )}

        {/* Answer Options */}
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(currentQuestion.options).map(([key, value]) => {
            const optionText = language === 'en' ? value.en : value.fr;
            const isSelected = selectedAnswer === key;
            const showResult = gameState === 'answering';
            const isCorrectAnswer = key === currentQuestion.correctAnswer;

            let bgColor = 'border-[#222222]/10 bg-[#F9F9F9] hover:bg-[#F0F0F0]';
            if (showResult) {
              if (isCorrectAnswer) {
                bgColor = 'border-[#008080] bg-[#E3F4F4]';
              } else if (isSelected && !isCorrect) {
                bgColor = 'border-[#E63946] bg-[#FFE5E8]';
              }
            } else if (isSelected) {
              bgColor = 'border-[#008080] bg-[#E3F4F4]';
            }

            return (
              <button
                key={key}
                onClick={() => handleAnswerSelect(key as 'A' | 'B' | 'C' | 'D')}
                disabled={gameState === 'answering'}
                className={`rounded-lg border-2 px-4 py-3 text-left text-sm transition-colors ${bgColor} ${
                  gameState === 'answering' ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <span className="mr-2 font-bold text-[#008080]">{key}.</span>
                <span className="text-[#1a1a1a]">{optionText}</span>
              </button>
            );
          })}
        </div>

        {/* Voice Input - Prominent Button */}
        {gameState === 'playing' && (
          <div className="space-y-2">
            <button
              onClick={startListening}
              disabled={isListening || isSpeaking}
              className={`w-full rounded-lg border-2 px-5 py-4 text-sm font-bold transition-all ${
                isListening
                  ? 'animate-pulse border-[#E63946] bg-[#FFE5E8] text-[#E63946] shadow-lg'
                  : isSpeaking
                  ? 'border-[#222222]/10 bg-[#F9F9F9] text-[#999999] cursor-not-allowed'
                  : 'border-[#008080] bg-[#008080] text-white hover:bg-[#006666] shadow-sm'
              }`}
            >
              {isListening 
                ? `🎤 ${language === 'en' ? 'Listening...' : 'Écoute...'}` 
                : isSpeaking 
                ? `⏳ ${language === 'en' ? 'Please wait...' : 'Patientez...'}` 
                : `🎤 ${language === 'en' ? 'Speak Your Answer' : 'Parlez Votre Réponse'}`
              }
            </button>
            {transcript && (
              <p className="text-center text-sm text-[#555555]">
                {language === 'en' ? 'You said:' : 'Vous avez dit:'} <span className="font-semibold text-[#008080]">{transcript}</span>
              </p>
            )}
            <p className="text-center text-xs text-[#999999]">
              {language === 'en' ? 'Say "A", "B", "C", or "D"' : 'Dites "A", "B", "C" ou "D"'}
            </p>
          </div>
        )}

        {/* Result & Explanation */}
        {gameState === 'answering' && (
          <div className="space-y-3">
            <div className={`rounded-lg border-2 px-4 py-4 ${
              isCorrect ? 'border-[#008080] bg-[#E3F4F4]' : 'border-[#E63946] bg-[#FFE5E8]'
            }`}>
              <p className="mb-2 text-sm font-bold">
                {isCorrect 
                  ? `${language === 'en' ? '✅ Correct!' : '✅ Correct!'} +${currentQuestion.points} ${language === 'en' ? 'points' : 'points'}`
                  : `${language === 'en' ? '❌ Incorrect' : '❌ Incorrect'}`
                }
              </p>
              <p className="text-sm text-[#1a1a1a]">{explanation}</p>
            </div>

            <button
              onClick={nextQuestion}
              className="w-full rounded-lg bg-[#008080] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#006666] transition-colors shadow-sm"
            >
              {currentQuestionIndex + 1 < questions.length
                ? `${language === 'en' ? 'Next Question →' : 'Question Suivante →'}`
                : `${language === 'en' ? 'Complete Quiz 🏆' : 'Terminer le Quiz 🏆'}`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
