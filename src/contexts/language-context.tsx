"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

import { useRouter, usePathname } from "next/navigation";

import { locales, defaultLocale, type Locale } from "@/i18n/config";

interface LanguageContextType {
  currentLocale: Locale;
  changeLanguage: (locale: Locale) => void;
  isLanguageMenuOpen: boolean;
  setIsLanguageMenuOpen: (open: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Extract locale from pathname
    const pathLocale = pathname.split("/")[1];
    if (locales.includes(pathLocale as Locale)) {
      setCurrentLocale(pathLocale as Locale);
    }
  }, [pathname]);

  const changeLanguage = (locale: Locale) => {
    setCurrentLocale(locale);

    // Update the URL to include the new locale
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
    const newPath = `/${locale}${pathWithoutLocale}`;
    router.push(newPath);

    setIsLanguageMenuOpen(false);
  };

  const contextValue = useMemo(
    () => ({
      currentLocale,
      changeLanguage,
      isLanguageMenuOpen,
      setIsLanguageMenuOpen,
    }),
    [currentLocale, isLanguageMenuOpen, pathname, router, changeLanguage],
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
