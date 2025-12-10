"use client";

import { useState } from "react";
import { useSettings } from "../settings-provider";
import CrisisVoiceAgent from "../../components/CrisisVoiceAgent";
import { strings, t } from "../../i18n/strings";
import { ServiceEntry } from "../../data/servicesDirectory";
import { AlertCircle, Phone, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CrisisResponse {
  answer: string;
  safetyNotice: string;
  localMatches: ServiceEntry[];
}

export default function CrisisPage() {
  const { language, discreetMode } = useSettings();
  const [result, setResult] = useState<CrisisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className={`mx-auto flex min-h-screen max-w-3xl flex-col gap-6 ${discreetMode ? "bg-black" : "bg-[#F9F9F9]"} px-6 py-8 lg:py-12`}>
      <header className="space-y-3 max-w-2xl">
        {!discreetMode && (
          <>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E63946]/10 px-4 py-2">
              <AlertCircle className="w-4 h-4 text-[#E63946]" />
              <span className="text-sm font-bold text-[#E63946]">{t(strings.crisis.title, language)}</span>
            </div>
            <p className="text-base text-[#555555] leading-relaxed">{t(strings.crisis.subtitle, language)}</p>
          </>
        )}
      </header>

      <CrisisVoiceAgent
        onComplete={(res) => {
          setResult(res as CrisisResponse);
        }}
      />

      {error && <section className="rounded-xl border-2 border-[#E63946] bg-[#E63946]/10 px-5 py-4 text-sm text-[#E63946] font-medium">{error}</section>}

      {result && (
        <section className="space-y-5 rounded-xl border border-[#222222]/10 bg-white px-6 py-6 shadow-md max-w-2xl">
          <div className="space-y-4">
            <p className="text-sm font-bold text-[#E63946]">{t(strings.crisis.step2, language)}</p>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-[#222222] mt-6 mb-3 flex items-center gap-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-[#222222] mt-5 mb-2 flex items-center gap-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold text-[#555555] mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-base text-[#222222] leading-relaxed mb-3" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-none space-y-2 my-3 pl-0" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal space-y-2 my-3 pl-6 marker:text-[#E63946] marker:font-bold" {...props} />,
                  li: ({node, ...props}) => <li className="text-base text-[#222222] leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-[#222222]" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-[#555555]" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#008080] pl-4 my-3 text-[#555555] italic" {...props} />,
                }}
              >
                {result.answer}
              </ReactMarkdown>
            </div>
            <p className="text-sm text-[#555555] italic border-t border-[#222222]/10 pt-4">{result.safetyNotice}</p>
          </div>

          {result.localMatches && result.localMatches.length > 0 && (
            <div className="space-y-4 border-t border-[#222222]/10 pt-5">
              <p className="text-base font-bold text-[#008080] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {language === "fr" ? "Cliniques recommandées" : "Recommended clinics"}
              </p>
              <div className="space-y-3">
                {result.localMatches.map((m) => (
                  <div key={m.id} className="rounded-lg border border-[#222222]/10 bg-[#F9F9F9] p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-[#222222]">{m.name}</p>
                        <p className="text-sm text-[#555555] mt-1">{m.city}</p>
                      </div>
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="rounded-lg bg-[#E63946] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#d62839] flex-shrink-0 shadow-sm transition-all flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
