"use client";

import { useState } from "react";
import { emergencyHotlines } from '@/data/emergencyHotlines';
import HIVQuizGame from '@/components/HIVQuizGame';
import QuizCertificate from '@/components/QuizCertificate';
import { useSettings } from "../settings-provider";

type ViewMode = 'hotlines' | 'quiz' | 'certificate';

export default function ResourcesPage() {
  const { language } = useSettings();
  const [viewMode, setViewMode] = useState<ViewMode>('hotlines');
  const [quizResults, setQuizResults] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);

  const handleQuizComplete = (score: number, correctAnswers: number, totalQuestions: number) => {
    setQuizResults({ score, correctAnswers, totalQuestions });
    setViewMode('certificate');
  };

  const makeCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-50">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">
          {language === 'en' ? 'Debunk the Stigma' : 'Démystifier'}
        </h1>
        <p className="text-xs text-zinc-300">
          {language === 'en'
            ? 'Combat misinformation. Access emergency support and test your HIV knowledge.'
            : 'Combattez la désinformation. Accès urgence et testez vos connaissances VIH.'}
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('hotlines')}
          className={`flex-1 rounded-lg border px-3 py-2 text-[10px] font-semibold transition-colors ${
            viewMode === 'hotlines'
              ? 'border-red-700 bg-red-900 text-red-100'
              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          {language === 'en' ? 'Hotlines' : 'Urgence'}
        </button>
        <button
          onClick={() => {
            setViewMode('quiz');
            setQuizResults(null);
          }}
          className={`flex-1 rounded-lg border px-3 py-2 text-[10px] font-semibold transition-colors ${
            viewMode === 'quiz'
              ? 'border-emerald-700 bg-emerald-900 text-emerald-100'
              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          {language === 'en' ? 'Quiz' : 'Quiz'}
        </button>
        {quizResults && (
          <button
            onClick={() => setViewMode('certificate')}
            className={`flex-1 rounded-lg border px-3 py-2 text-[10px] font-semibold transition-colors ${
              viewMode === 'certificate'
                ? 'border-yellow-700 bg-yellow-900 text-yellow-100'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {language === 'en' ? 'Certificate' : 'Certificat'}
          </button>
        )}
      </div>

      {/* Content Area */}
      {viewMode === 'hotlines' && (
        <div className="space-y-4">
          <section className="rounded-xl border border-red-800 bg-red-950 px-3 py-3 text-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-300 mb-1">
              {language === 'en' ? 'Emergency HIV/AIDS Hotlines' : 'Lignes d\'Urgence VIH/SIDA'}
            </p>
            <p className="text-[11px] text-zinc-300">
              {language === 'en'
                ? 'Free, confidential support 24/7. Tap to call immediately.'
                : 'Soutien gratuit et confidentiel 24h/24. Appuyez pour appeler.'}
            </p>
          </section>

          {emergencyHotlines.map((country) => (
            <section
              key={country.countryCode}
              className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3"
            >
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  {country.flag} {country.country}
                </p>
              </div>

              <div className="space-y-2">
                {country.hotlines.map((hotline, index) => (
                  <article
                    key={index}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h2 className="text-[11px] font-semibold text-zinc-100">
                          {language === 'en' ? hotline.nameEn : hotline.nameFr}
                        </h2>
                        <p className="mt-1 text-[10px] text-zinc-400">
                          {language === 'en' ? hotline.descriptionEn : hotline.descriptionFr}
                        </p>
                        <p className="mt-1 text-[9px] text-zinc-500">
                          {language === 'en' ? hotline.availableEn : hotline.availableFr}
                        </p>
                      </div>
                      <button
                        onClick={() => makeCall(hotline.number)}
                        className="ml-1 flex flex-col items-center justify-center rounded-lg border border-emerald-700 bg-emerald-900 px-3 py-2 hover:bg-emerald-800 transition-colors"
                      >
                        <span className="text-xs">📞</span>
                        <span className="text-[9px] font-semibold text-emerald-100">{hotline.number}</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {viewMode === 'quiz' && (
        <HIVQuizGame language={language} onComplete={handleQuizComplete} />
      )}

      {viewMode === 'certificate' && quizResults && (
        <QuizCertificate
          score={quizResults.score}
          correctAnswers={quizResults.correctAnswers}
          totalQuestions={quizResults.totalQuestions}
          language={language}
          onClose={() => setViewMode('hotlines')}
        />
      )}
    </main>
  );
}
