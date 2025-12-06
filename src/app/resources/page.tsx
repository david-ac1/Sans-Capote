"use client";

import { useState } from "react";
import { emergencyHotlines } from '@/data/emergencyHotlines';
import HIVQuizGame from '@/components/HIVQuizGame';
import QuizCertificate from '@/components/QuizCertificate';
import { useSettings } from "../settings-provider";
import { AlertCircle, Gamepad2, Award, Phone } from 'lucide-react';

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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 bg-[#F9F9F9] px-6 py-8 lg:py-12">
      <header className="space-y-3 max-w-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#222222]">
          {language === 'en' ? 'Debunk the Stigma' : 'Démystifier'}
        </h1>
        <p className="text-base text-[#555555] leading-relaxed">
          {language === 'en'
            ? 'Combat misinformation. Access emergency support and test your HIV knowledge.'
            : 'Combattez la désinformation. Accès urgence et testez vos connaissances VIH.'}
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-3 max-w-2xl flex-wrap sm:flex-nowrap">
        <button
          onClick={() => setViewMode('hotlines')}
          className={`flex-1 min-w-[140px] rounded-xl border-2 px-5 py-3.5 text-sm font-bold transition-all shadow-sm ${
            viewMode === 'hotlines'
              ? 'border-[#E63946] bg-[#E63946] text-white scale-105'
              : 'border-[#222222]/10 bg-white text-[#555555] hover:border-[#E63946] hover:shadow-md'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {language === 'en' ? 'Hotlines' : 'Urgence'}
          </span>
        </button>
        <button
          onClick={() => {
            setViewMode('quiz');
            setQuizResults(null);
          }}
          className={`flex-1 min-w-[140px] rounded-xl border-2 px-5 py-3.5 text-sm font-bold transition-all shadow-sm ${
            viewMode === 'quiz'
              ? 'border-[#008080] bg-[#008080] text-white scale-105'
              : 'border-[#222222]/10 bg-white text-[#555555] hover:border-[#008080] hover:shadow-md'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            {language === 'en' ? 'Quiz' : 'Quiz'}
          </span>
        </button>
        {quizResults && (
          <button
            onClick={() => setViewMode('certificate')}
            className={`flex-1 min-w-[140px] rounded-xl border-2 px-5 py-3.5 text-sm font-bold transition-all shadow-sm ${
              viewMode === 'certificate'
                ? 'border-[#F4D35E] bg-[#F4D35E] text-[#222222] scale-105'
                : 'border-[#222222]/10 bg-white text-[#555555] hover:border-[#F4D35E] hover:shadow-md'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4" />
              {language === 'en' ? 'Certificate' : 'Certificat'}
            </span>
          </button>
        )}
      </div>

      {/* Content Area */}
      {viewMode === 'hotlines' && (
        <div className="space-y-6 max-w-2xl">
          <section className="rounded-xl border-2 border-[#E63946] bg-[#E63946]/10 px-5 py-4">
            <p className="text-sm font-bold text-[#E63946] mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {language === 'en' ? 'Emergency HIV/AIDS Hotlines' : 'Lignes d\'Urgence VIH/SIDA'}
            </p>
            <p className="text-sm text-[#222222]">
              {language === 'en'
                ? 'Free, confidential support 24/7. Tap to call immediately.'
                : 'Soutien gratuit et confidentiel 24h/24. Appuyez pour appeler.'}
            </p>
          </section>

          {emergencyHotlines.map((country) => (
            <section
              key={country.countryCode}
              className="space-y-3 rounded-xl border border-[#222222]/10 bg-white px-5 py-5 shadow-sm"
            >
              <div>
                <p className="text-base font-bold text-[#008080]">
                  {country.flag} {country.country}
                </p>
              </div>

              <div className="space-y-3">
                {country.hotlines.map((hotline, index) => (
                  <article
                    key={index}
                    className="rounded-lg border border-[#222222]/10 bg-[#F9F9F9] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h2 className="text-sm font-semibold text-[#222222]">
                          {language === 'en' ? hotline.nameEn : hotline.nameFr}
                        </h2>
                        <p className="mt-1 text-sm text-[#555555]">
                          {language === 'en' ? hotline.descriptionEn : hotline.descriptionFr}
                        </p>
                        <p className="mt-1 text-xs text-[#555555] italic">
                          {language === 'en' ? hotline.availableEn : hotline.availableFr}
                        </p>
                      </div>
                      <button
                        onClick={() => makeCall(hotline.number)}
                        className="flex flex-col items-center justify-center rounded-lg bg-[#008080] px-4 py-3 hover:bg-[#006666] transition-colors shadow-sm"
                      >
                        <Phone className="w-5 h-5 text-white" />
                        <span className="text-xs font-bold text-white mt-1">{hotline.number}</span>
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
