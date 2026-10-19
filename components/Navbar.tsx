"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Sun, Moon, Plus, User as UserIcon, LogOut } from "lucide-react";
import { HexagonLogo } from "@/components/Icons";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: t("nav.explore"), href: "/explore" },
    { label: t("nav.activity"), href: "/activity" },
    { label: t("nav.builders"), href: "/builders" },
    { label: t("nav.community"), href: "/community" },
    { label: t("nav.about"), href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/90 backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        {/* Logo */}
        <Link className="flex items-center gap-2.5 shrink-0 group" href="/">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface border border-border text-foreground shadow-sm group-hover:scale-105 transition-all">
            <HexagonLogo className="h-4.5 w-4.5 text-foreground group-hover:text-primary transition-colors" strokeWidth={2.2} />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            zemit
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[12px] px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-surface-muted text-foreground font-semibold"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-[12px] text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-[12px] text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-[12px] text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground cursor-pointer"
          >
            {!mounted ? (
              <span className="h-[18px] w-[18px]" />
            ) : theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Switch language"
            className="flex h-9 items-center justify-center rounded-[12px] px-2.5 text-xs font-semibold text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground cursor-pointer"
          >
            {!mounted ? "한국어" : language === "ko" ? "한국어" : "EN"}
          </button>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* User / Login */}
          {!mounted ? (
            <div className="h-9 w-16" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-[12px] p-1 text-sm font-medium transition-colors hover:bg-surface-muted cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                />
                <span className="max-w-[100px] truncate text-xs font-semibold text-foreground hidden lg:inline-block">
                  {user.name}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-card border border-border bg-surface p-2 shadow-popover z-50 animate-fade-in"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-foreground">{user.name}</p>
                    <p className="text-[11px] text-muted">@{user.handle}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-control px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-muted" />
                      내 프로필
                    </Link>
                    <Link
                      href="/activity"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-control px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
                    >
                      내 활동 기록
                    </Link>
                  </div>

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-xs font-medium text-danger hover:bg-danger-soft cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-[12px] px-3 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground"
            >
              {t("nav.login")}
            </Link>
          )}

          {/* New Project Button */}
          <Link
            href={user ? "/projects/new" : "/login?redirect=/projects/new"}
            className="flex items-center gap-1.5 rounded-[12px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            <span>{t("nav.newProject")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

