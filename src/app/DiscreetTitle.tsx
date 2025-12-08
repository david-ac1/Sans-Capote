"use client";

import { useEffect } from "react";
import { useSettings } from "./settings-provider";

export function DiscreetTitle() {
  const { discreetMode, language } = useSettings();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const normalTitle = language === "fr" 
      ? "Sans Capote – Santé Sexuelle et Soutien VIH Privé"
      : "Sans Capote – Private Sexual Health & HIV Support";
    
    const discreetTitle = language === "fr"
      ? "Santé Personnel – Application de Bien-être"
      : "Personal Health – Wellness App";

    document.title = discreetMode ? discreetTitle : normalTitle;
  }, [discreetMode, language]);

  return null;
}
