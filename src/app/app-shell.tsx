"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Home, MessageCircle, Map, BookOpen, AlertCircle, ChevronLeft } from "lucide-react";
import { useSettings } from "./settings-provider";
import { strings, t } from "../i18n/strings";

const NAV_ITEMS = [
  { href: "/guide", label: "Guide", icon: MessageCircle },
  { href: "/navigator", label: "Navigator", icon: Map },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/crisis", label: "Crisis", icon: AlertCircle },
];

function getSectionTitle(pathname: string, discreetMode: boolean, language: string): string {
  if (discreetMode) {
    if (pathname.startsWith("/guide")) return language === 'fr' ? 'Info' : 'Info';
    if (pathname.startsWith("/navigator")) return language === 'fr' ? 'Services' : 'Services';
    if (pathname.startsWith("/resources")) return language === 'fr' ? 'Info' : 'Info';
    if (pathname.startsWith("/crisis")) return language === 'fr' ? 'Soutien' : 'Support';
    if (pathname.startsWith("/settings")) return language === 'fr' ? 'Paramètres' : 'Settings';
    return language === 'fr' ? 'Accueil' : 'Home';
  }

  if (pathname.startsWith("/guide")) return language === 'fr' ? t(strings.nav.sectionTitle.guide, 'fr') : t(strings.nav.sectionTitle.guide, 'en');
  if (pathname.startsWith("/navigator")) return language === 'fr' ? t(strings.nav.sectionTitle.navigator, 'fr') : t(strings.nav.sectionTitle.navigator, 'en');
  if (pathname.startsWith("/resources")) return language === 'fr' ? t(strings.nav.sectionTitle.resources, 'fr') : t(strings.nav.sectionTitle.resources, 'en');
  if (pathname.startsWith("/crisis")) return language === 'fr' ? t(strings.nav.sectionTitle.crisis, 'fr') : t(strings.nav.sectionTitle.crisis, 'en');
  if (pathname.startsWith("/settings")) return language === 'fr' ? t(strings.nav.sectionTitle.settings, 'fr') : t(strings.nav.sectionTitle.settings, 'en');
  return language === 'fr' ? 'Accueil' : 'Home';
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { language, countryCode: _countryCode, discreetMode } = useSettings();

  const sectionTitle = getSectionTitle(pathname, discreetMode, language);
  const showBack = pathname !== "/";
  const brandLabel = 'Sans Capote';

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <header className="border-b border-[#222222]/10 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack ? (
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-[#008080] hover:text-[#006666] font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Home
              </button>
            ) : (
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#008080] to-[#00a8a8] bg-clip-text text-transparent animate-gradient">
                {brandLabel}
              </h1>
            )}
            {sectionTitle && pathname !== "/" && <span className="text-sm text-[#555555]">{sectionTitle}</span>}
          </div>
          <Link href="/settings" className="text-sm text-[#555555] hover:text-[#008080] font-medium">
            Settings
          </Link>
        </div>
      </header>

      <div className="flex-1">
        {children}
      </div>

      <nav className="border-t border-[#222222]/10 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-7xl items-center justify-around gap-2">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all ${
              pathname === "/" ? "text-[#008080] scale-105" : "text-[#555555] hover:text-[#008080] hover:bg-[#008080]/5"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-semibold">{language === 'fr' ? 'Accueil' : 'Home'}</span>
          </Link>
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const IconComponent = item.icon;
            let label = item.label;
            if (discreetMode) {
              if (item.href === '/guide') label = language === 'fr' ? 'Info' : 'Info';
              if (item.href === '/navigator') label = language === 'fr' ? 'Services' : 'Services';
              if (item.href === '/resources') label = language === 'fr' ? 'Info' : 'Info';
              if (item.href === '/crisis') label = language === 'fr' ? 'Soutien' : 'Support';
            } else {
              if (item.href === '/guide') label = t(strings.nav.guide, language as any);
              if (item.href === '/navigator') label = t(strings.nav.navigator, language as any);
              if (item.href === '/resources') label = t(strings.nav.resources, language as any);
              if (item.href === '/crisis') label = t(strings.nav.crisis, language as any);
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all ${
                  active ? "text-[#008080] scale-105" : "text-[#555555] hover:text-[#008080] hover:bg-[#008080]/5"
                }`}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
