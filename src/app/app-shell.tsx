"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { Home, MessageCircle, Map, BookOpen, AlertCircle, Menu, X } from "lucide-react";
import { useSettings } from "./settings-provider";
import { strings, t } from "../i18n/strings";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/guide", label: "Guide", icon: MessageCircle },
  { href: "/navigator", label: "Services", icon: Map },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/crisis", label: "Crisis", icon: AlertCircle },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const { language, countryCode: _countryCode } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#F8FAFF] via-[#FFF] to-[#F0F4FF]">
      {/* Modern Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Left aligned, vertically centered */}
            <Link href="/" className="flex items-center h-full py-2">
              <div className="relative h-full w-auto">
                <Image 
                  src="/logo.png" 
                  alt="Sans Capote" 
                  width={160} 
                  height={48}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const IconComponent = item.icon;
                
                let label = item.label;
                if (item.href === '/guide') label = language === 'fr' ? 'Guide' : 'Guide';
                if (item.href === '/navigator') label = language === 'fr' ? 'Services' : 'Services';
                if (item.href === '/resources') label = language === 'fr' ? 'Ressources' : 'Resources';
                if (item.href === '/crisis') label = language === 'fr' ? 'Urgence' : 'Crisis';
                if (item.href === '/') label = language === 'fr' ? 'Accueil' : 'Home';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      active
                        ? "bg-[#008080]/10 text-[#008080]"
                        : "text-[#64748b] hover:bg-[#F8FAFF] hover:text-[#008080]"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Settings Button (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/settings"
                className="rounded-full border-2 border-[#008080] bg-white px-5 py-2 text-sm font-semibold text-[#008080] hover:bg-[#008080] hover:text-white transition-all"
              >
                {language === 'fr' ? 'Paramètres' : 'Settings'}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-[#64748b] hover:bg-[#F8FAFF] hover:text-[#008080] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e2e8f0] bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const IconComponent = item.icon;
                
                let label = item.label;
                if (item.href === '/guide') label = language === 'fr' ? 'Guide' : 'Guide';
                if (item.href === '/navigator') label = language === 'fr' ? 'Services' : 'Services';
                if (item.href === '/resources') label = language === 'fr' ? 'Ressources' : 'Resources';
                if (item.href === '/crisis') label = language === 'fr' ? 'Urgence' : 'Crisis';
                if (item.href === '/') label = language === 'fr' ? 'Accueil' : 'Home';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all ${
                      active
                        ? "bg-[#008080]/10 text-[#008080]"
                        : "text-[#64748b] hover:bg-[#F8FAFF] hover:text-[#008080]"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#008080] bg-white px-4 py-3 text-base font-semibold text-[#008080] hover:bg-[#008080] hover:text-white transition-all mt-4"
              >
                {language === 'fr' ? 'Paramètres' : 'Settings'}
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white/50 backdrop-blur-sm py-6 px-4">
        <div className="mx-auto max-w-7xl space-y-3">
          <p className="text-center text-xs text-[#94a3b8]">
            {language === 'fr' 
              ? 'Cet outil ne remplace pas un médecin. En cas d\'urgence, rendez-vous à la clinique ou à l\'hôpital le plus proche.'
              : 'This tool does not replace a doctor. In an emergency, go to the nearest clinic or hospital.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#64748b]">
            <span className="font-semibold">Ending AIDS by 2030</span>
            <span className="hidden sm:inline">•</span>
            <span>Powered by ElevenLabs and Google Cloud</span>
            <span className="hidden sm:inline">•</span>
            <span>Built by David Chukwuebuka Achibiri</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
