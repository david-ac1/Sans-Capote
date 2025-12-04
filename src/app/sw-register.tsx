"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // In development, unregister any previously-registered service workers
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister().catch(() => {}));
      });
      return;
    }

    // Only register the service worker in production
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => {
        console.error("Service worker registration failed", err);
      });
  }, []);

  return null;
}
