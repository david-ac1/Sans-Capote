import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "./settings-provider";
import { AppShell } from "./app-shell";
import { SwRegister } from "./sw-register";
import { ErrorBoundary } from "../lib/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <SettingsProvider>
            <SwRegister />
            <AppShell>{children}</AppShell>
          </SettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
