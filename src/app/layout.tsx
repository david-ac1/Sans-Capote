import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "./settings-provider";
import { AppShell } from "./app-shell";
import { SwRegister } from "./sw-register";
import { ErrorBoundary } from "../lib/ErrorBoundary";
import { DiscreetTitle } from "./DiscreetTitle";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Sans Capote – Private Sexual Health & HIV Support",
  description:
    "Offline-friendly, stigma-free sexual health and HIV prevention guidance for African contexts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Confetti library for quiz celebrations */}
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js" async></script>
        {/* html2canvas for certificate generation */}
        <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js" async></script>
      </head>
      <body
        className={`${sora.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <SettingsProvider>
            <DiscreetTitle />
            <SwRegister />
            <AppShell>{children}</AppShell>
          </SettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
