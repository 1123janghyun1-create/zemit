"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ko: {
    "nav.explore": "탐색",
    "nav.upcoming": "런칭 D-Day",
    "nav.leaderboard": "명예의 전당",
    "nav.builders": "빌더",
    "nav.ideas": "아이디어",
    "nav.community": "커뮤니티",
    "nav.activity": "내 활동",
    "nav.about": "소개",
    "nav.login": "로그인",
    "nav.logout": "로그아웃",
    "nav.newProject": "프로젝트 등록",
    "nav.random": "오늘의 랜덤 탐험",
    "nav.search": "검색",
    "nav.notifications": "알림",
    "nav.profile": "내 프로필",
    "hero.badge": "사이드 프로젝트 메이커 커뮤니티",
    "hero.tagline": "아이디어를 실제로 빌드하고 런칭하는 메이커들을 위한 공간. 초기 유저 피드백과 함께 성장할 동료를 만나보세요.",
    "hero.banner": "zemix 둘러보기 →",
    "search.placeholder": "프로젝트, 태그, 메이커 검색 (Cmd+K)",
    "filter.popular": "인기순",
    "filter.newest": "최신순",
    "filter.mostLiked": "좋아요순",
    "filter.recentlyUpdated": "최근 업데이트순",
    "filter.lookingForTesters": "테스터 모집 중",
    "filter.lookingForTeam": "팀원 구함",
    "featured.title": "오늘의 추천 프로젝트",
    "featured.view": "프로젝트 보기",
    "all.title": "전체 프로젝트",
    "all.subtitle": "국내외 인디 메이커들의 신선한 사이드 프로젝트",
    "project.public": "공개",
    "project.beta": "베타",
    "project.mvp": "MVP",
    "empty.noProjects": "등록된 프로젝트가 없습니다.",
    "empty.registerFirst": "첫 번째 프로젝트를 등록하고 피드백을 받아보세요!",
    "btn.newProject": "첫 프로젝트 등록하기",
    "footer.rights": "© zemix. All rights reserved.",
  },
  en: {
    "nav.explore": "Explore",
    "nav.upcoming": "Launch D-Day",
    "nav.leaderboard": "Leaderboard",
    "nav.builders": "Builders",
    "nav.ideas": "Ideas",
    "nav.community": "Community",
    "nav.activity": "My Activity",
    "nav.about": "About",
    "nav.login": "Sign In",
    "nav.logout": "Log Out",
    "nav.newProject": "New Project",
    "nav.random": "Explore Random Project",
    "nav.search": "Search",
    "nav.notifications": "Notifications",
    "nav.profile": "My Profile",
    "hero.badge": "Side Project Maker Community",
    "hero.tagline": "A launchpad for tech makers turning ideas into real software. Get early user feedback and connect with collaborators.",
    "hero.banner": "Explore zemix →",
    "search.placeholder": "Search projects, tags, builders (Cmd+K)",
    "filter.popular": "Popular",
    "filter.newest": "Newest",
    "filter.mostLiked": "Most Liked",
    "filter.recentlyUpdated": "Recently Updated",
    "filter.lookingForTesters": "Looking for Testers",
    "filter.lookingForTeam": "Looking for Team",
    "featured.title": "Featured Today",
    "featured.view": "View Project",
    "all.title": "All Projects",
    "all.subtitle": "Fresh side projects crafted by indie builders worldwide",
    "project.public": "Public",
    "project.beta": "Beta",
    "project.mvp": "MVP",
    "empty.noProjects": "No projects registered yet.",
    "empty.registerFirst": "Be the first maker to publish a project and collect feedback!",
    "btn.newProject": "Publish Your Project",
    "footer.rights": "© zemix. All rights reserved.",
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
    if (stored === "ko" || stored === "en") {
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
    return translations[language]?.[key] || translations.ko[key] || key;
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
