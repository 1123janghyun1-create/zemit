"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Rocket,
  Trophy,
  Users,
  Lightbulb,
  MessageSquare,
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  User as UserIcon,
  LogOut,
  Dices,
  ShieldCheck,
  Zap,
  Gift,
  Flame,
  Sparkles,
  Play,
} from "lucide-react";
import { HexagonLogo } from "@/components/Icons";
import DemoVideoModal from "@/components/DemoVideoModal";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getBuilderXp } from "@/lib/storage";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleRandomProject = async () => {
    if (isRolling) return;
    setIsRolling(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      const list = data.projects || (Array.isArray(data) ? data : []);
      if (list && list.length > 0) {
        const randomProj = list[Math.floor(Math.random() * list.length)];
        router.push(`/projects/${randomProj.id}`);
      } else {
        router.push("/explore");
      }
    } catch {
      router.push("/explore");
    } finally {
      setTimeout(() => setIsRolling(false), 600);
    }
  };

  const navItems = [
    { label: t("nav.explore"), href: "/explore", icon: Compass },
    { label: t("nav.leaderboard"), href: "/leaderboard", icon: Trophy },
    { label: t("nav.builders"), href: "/builders", icon: Users },
    { label: t("nav.ideas"), href: "/ideas", icon: Lightbulb },
    { label: t("nav.community"), href: "/community", icon: MessageSquare },
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
            zemix
          </span>
        </Link>

        {/* Navigation - Clean, balanced, sleek icons without inconsistent emojis */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-surface-muted text-foreground font-semibold shadow-xs"
                    : "text-muted hover:bg-surface-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted/70"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* I'm Feeling Lucky (Random Project) */}
          <button
            type="button"
            onClick={handleRandomProject}
            title={t("nav.random")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-all duration-200 hover:bg-primary-soft hover:text-primary cursor-pointer group"
          >
            <Dices className={`h-[18px] w-[18px] transition-transform duration-500 ${isRolling ? "rotate-180 scale-110 text-primary" : "group-hover:rotate-45"}`} />
          </button>

          {/* Search */}
          <Link
            href="/search"
            aria-label="Search"
            title={`${t("nav.search")} (Cmd+K)`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            title={t("nav.notifications")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground cursor-pointer"
          >
            {!mounted ? (
              <span className="h-[18px] w-[18px]" />
            ) : theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* Bilingual Language Switcher (Segmented Pill) */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Switch language"
            title="한국어 / English"
            className="flex h-8 items-center rounded-lg border border-border bg-surface px-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <span className={language === "ko" ? "text-primary font-bold" : "text-muted"}>KO</span>
            <span className="mx-1 text-border-strong text-[10px]">/</span>
            <span className={language === "en" ? "text-primary font-bold" : "text-muted"}>EN</span>
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
                className="flex items-center gap-2 rounded-lg p-1 text-sm font-medium transition-colors hover:bg-surface-muted cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                />
                <div className="hidden lg:flex flex-col items-start text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="max-w-[100px] truncate text-xs font-semibold text-foreground">
                      {user.name}
                    </span>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-card border border-border bg-surface p-2 shadow-popover z-50 animate-fade-in"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <ShieldCheck className="h-3 w-3" />
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted">@{user.handle}</p>

                    {/* Builder XP & Level */}
                    {(() => {
                      const xpInfo = getBuilderXp(user.id);
                      return (
                        <div className="mt-2 rounded-lg bg-surface-muted/60 p-2 border border-border/60">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-primary flex items-center gap-1">
                              <Zap className="h-3 w-3 fill-current" />
                              Lv.{xpInfo.level} {xpInfo.tier}
                            </span>
                            <span className="text-muted font-mono">{xpInfo.xp} XP</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-surface border border-border overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${xpInfo.xp % 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="py-1">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 rounded-control px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 mb-1 transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>관리자 센터 (Admin)</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-control px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-muted" />
                      {t("nav.profile")}
                    </Link>
                    <Link
                      href="/perks"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-control px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
                    >
                      <Gift className="h-3.5 w-3.5 text-primary" />
                      <span>B2B 혜택 몰</span>
                    </Link>
                    <Link
                      href="/challenges"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-control px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
                    >
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      <span>월간 챌린지</span>
                    </Link>
                    <Link
                      href="/lounge"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-control px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                      <span>라이브 라운지</span>
                    </Link>
                    <Link
                      href="/activity"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-control px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-muted" />
                      {t("nav.activity")}
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
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-foreground"
            >
              {t("nav.login")}
            </Link>
          )}

          {/* Demo Video Launcher */}
          <button
            type="button"
            onClick={() => setShowDemoVideo(true)}
            aria-label="Watch Demo Video"
            title="zemix 공식 시연 영상 (English Voiceover)"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Demo Video</span>
          </button>

          {/* New Project Button */}
          <Link
            href={user ? "/projects/new" : "/login?redirect=/projects/new"}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            <span>{t("nav.newProject")}</span>
          </Link>
        </div>
      </div>

      {/* Official Demo Video Modal */}
      <DemoVideoModal
        isOpen={showDemoVideo}
        onClose={() => setShowDemoVideo(false)}
      />
    </header>
  );
}
