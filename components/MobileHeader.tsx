"use client";

import React from "react";
import Link from "next/link";
import { Search, Plus, Bell, Sun, Moon } from "lucide-react";
import { HexagonLogo } from "@/components/Icons";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function MobileHeader() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md md:hidden">
      <Link className="flex items-center gap-2 shrink-0" href="/">
        <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-surface border border-border text-foreground shadow-sm">
          <HexagonLogo className="h-4 w-4 text-foreground" strokeWidth={2.2} />
        </span>
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          zemit
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {/* Search */}
        <Link
          href="/search"
          aria-label="Search"
          className="flex h-8 w-8 items-center justify-center rounded-[12px] text-muted hover:text-foreground"
        >
          <Search className="h-[18px] w-[18px]" />
        </Link>

        {/* Plus / New Project */}
        <Link
          href={mounted && user ? "/projects/new" : "/login?redirect=/projects/new"}
          aria-label="New Project"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
        >
          <Plus className="h-[18px] w-[18px]" />
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center rounded-[12px] text-muted hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-[12px] text-muted hover:text-foreground cursor-pointer"
        >
          {!mounted ? (
            <span className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label="Switch language"
          className="flex h-8 items-center justify-center rounded-[12px] px-2 text-xs font-semibold text-muted hover:text-foreground cursor-pointer"
        >
          {!mounted ? "한국어" : language === "ko" ? "한국어" : "EN"}
        </button>

        {/* Profile / Login */}
        <Link
          href={mounted && user ? "/profile" : "/login"}
          aria-label="Profile"
          className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden"
        >
          {mounted && user ? (
            <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

