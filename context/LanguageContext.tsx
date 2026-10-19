"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ko: {
    "nav.explore": "Explore",
    "nav.activity": "My Activity",
    "nav.builders": "Builders",
    "nav.community": "Community",
    "nav.about": "About",
    "nav.login": "로그인",
    "nav.newProject": "New Project",
    "hero.tagline": "아이디어에서 출시까지. 피드백을 받고 팀원을 찾아 함께 성장하세요.",
    "hero.banner": "Zemit이 처음이신가요? 둘러보기 →",
    "search.placeholder": "프로젝트, 태그, 빌더 검색",
    "filter.popular": "Popular",
    "filter.newest": "Newest",
    "filter.mostLiked": "Most Liked",
    "filter.recentlyUpdated": "Recently Updated",
    "filter.lookingForTesters": "Looking for Testers",
    "filter.lookingForTeam": "Looking for Team",
    "featured.title": "Featured Today",
    "featured.view": "View Project",
    "all.title": "All projects",
    "project.public": "Public",
    "project.beta": "Beta",
    "project.mvp": "MVP",
    "footer.rights": "© Zemit. All rights reserved.",
  },
  en: {
    "nav.explore": "Explore",
    "nav.activity": "My Activity",
    "nav.builders": "Builders",
    "nav.community": "Community",
    "nav.about": "About",
    "nav.login": "Log in",
    "nav.newProject": "New Project",
    "hero.tagline": "From ideas to launched projects. Get feedback, find teammates, and grow together.",
    "hero.banner": "New to Zemit? See what it's all about →",
    "search.placeholder": "Search projects, tags, builders",
    "filter.popular": "Popular",
    "filter.newest": "Newest",
    "filter.mostLiked": "Most Liked",
    "filter.recentlyUpdated": "Recently Updated",
    "filter.lookingForTesters": "Looking for Testers",
    "filter.lookingForTeam": "Looking for Team",
    "featured.title": "Featured Today",
    "featured.view": "View Project",
    "all.title": "All projects",
    "project.public": "Public",
    "project.beta": "Beta",
    "project.mvp": "MVP",
    "footer.rights": "© Zemit. All rights reserved.",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "ko",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ko");

  useEffect(() => {
    const stored = (localStorage.getItem("lumio_lang") || localStorage.getItem("cozit_lang")) as Language | null;
    if (stored) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lumio_lang", lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === "ko" ? "en" : "ko";
    setLanguage(nextLang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

