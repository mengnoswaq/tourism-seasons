"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "kh";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (en: string, kh?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "tourism_seasons_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved === "en" || saved === "kh") {
        setLangState(saved);
      }
    } catch (e) {
      // Ignore localStorage read errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      // Ignore localStorage write errors
    }
  };

  const t = (en: string, kh?: string | null): string => {
    if (lang === "kh" && kh && kh.trim()) {
      return kh;
    }
    return en;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if component is used outside LanguageProvider
    return {
      lang: "en" as Language,
      setLang: () => {},
      t: (en: string, kh?: string | null) => (kh && kh.trim() ? kh : en),
    };
  }
  return context;
}
