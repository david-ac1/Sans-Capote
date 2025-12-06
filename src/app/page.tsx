"use client";

import { MessageCircle, Map, BookOpen, AlertCircle, Settings } from "lucide-react";
import { useSettings } from "./settings-provider";
import { strings, t } from "../i18n/strings";

export default function Home() {
  const { language } = useSettings();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8 lg:py-12">
        {/* Hero Section - Prominent Brand */}
        <header className="space-y-4 text-center mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#008080] tracking-tight">
            SANS CAPOTE
          </h1>
          
          <p className="text-lg sm:text-xl text-[#555555] max-w-xl mx-auto">
            {t(strings.home.subtitle, language)}
          </p>
        </header>

        {/* Compact Feature Cards */}
        <section className="space-y-3 max-w-3xl mx-auto w-full">
          {/* Primary Feature - Guide */}
          <a
            href="/guide"
            className="group flex items-center gap-4 rounded-lg bg-[#008080] px-6 py-5 hover:bg-[#007070] transition-colors shadow-sm"
          >
            <div className="rounded-lg bg-white/90 p-3">
              <MessageCircle className="w-6 h-6 text-[#008080]" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-white">
                {t(strings.home.cards.guide.title, language)}
              </p>
              <p className="text-sm text-white/90 mt-1">
                {t(strings.home.cards.guide.body, language)}
              </p>
            </div>
            <span className="text-white text-xl opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </a>

          {/* Three Square Cards - Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Navigator */}
            <a
              href="/navigator"
              className="group flex flex-col items-center justify-center gap-2 rounded-lg bg-[#E3F4F4] px-3 py-5 hover:bg-[#D1ECEC] transition-colors border border-[#008080]/20 aspect-square"
            >
              <div className="rounded-lg bg-[#008080] p-2.5">
                <Map className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold text-[#1a1a1a] text-center leading-tight">
                {t(strings.home.cards.navigator.title, language)}
              </p>
            </a>

            {/* Resources */}
            <a
              href="/resources"
              className="group flex flex-col items-center justify-center gap-2 rounded-lg bg-[#FFF9E6] px-3 py-5 hover:bg-[#FFF3D1] transition-colors border border-[#F4D35E]/30 aspect-square"
            >
              <div className="rounded-lg bg-[#F4D35E] p-2.5">
                <BookOpen className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <p className="text-xs font-bold text-[#1a1a1a] text-center leading-tight">
                {t(strings.home.cards.resources.title, language)}
              </p>
            </a>

            {/* Crisis - Urgent */}
            <a
              href="/crisis"
              className="group flex flex-col items-center justify-center gap-2 rounded-lg bg-[#FFE5E8] px-3 py-5 hover:bg-[#FFD1D6] transition-colors border-2 border-[#E63946] aspect-square"
            >
              <div className="rounded-lg bg-[#E63946] p-2.5">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-[#E63946] leading-tight">
                  {t(strings.home.cards.crisis.title, language)}
                </p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E63946] text-white">
                  24/7
                </span>
              </div>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-4 text-center">
          <p className="text-xs text-[#999999]">
            {t(strings.home.footerNotice, language)}
          </p>
        </footer>
      </main>
    </div>
  );
}
