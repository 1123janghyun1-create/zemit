"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Sparkles,
  RefreshCw,
  Heart,
  Eye,
  ArrowUpRight,
  Plus,
  Flame,
  Calendar,
} from "lucide-react";
import { Project } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { fetchSharedProjects, getProjects } from "@/lib/storage";

export default function LeaderboardPage() {
  const { language } = useLanguage();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const local = getProjects();
      if (local && local.length > 0 && allProjects.length === 0) {
        setAllProjects(local);
      }
      const data = await fetchSharedProjects();
      if (Array.isArray(data)) {
        setAllProjects(data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.warn("Leaderboard live sync error:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [allProjects.length]);

  // Initial mount + real-time interval (every 8 seconds) + lumio_data_synced event
  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date());
    loadData();

    // Auto-refresh interval for real-time live sync
    const interval = setInterval(() => {
      loadData(true);
    }, 8000);

    // Event listener when user likes/comments/adds a project anywhere in app
    const handleSync = () => loadData(true);
    window.addEventListener("lumio_data_synced", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("lumio_data_synced", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [loadData]);

  // Calculate ranking based on selected period
  const getFilteredAndSortedProjects = () => {
    let list = [...allProjects];

    if (!mounted) {
      return list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    if (period === "weekly") {
      // Prioritize projects created or updated within the last 7 days, scored by recent likes + views
      list.sort((a, b) => {
        const aAge = now - new Date(a.createdAt || a.updatedAt || now).getTime();
        const bAge = now - new Date(b.createdAt || b.updatedAt || now).getTime();
        const aRecentScore = (a.likesCount || 0) * 3 + (a.viewsCount || 0) + (aAge < sevenDays ? 50 : 0);
        const bRecentScore = (b.likesCount || 0) * 3 + (b.viewsCount || 0) + (bAge < sevenDays ? 50 : 0);
        return bRecentScore - aRecentScore;
      });
    } else if (period === "monthly") {
      // Monthly ranking: projects active within last 30 days
      list.sort((a, b) => {
        const aAge = now - new Date(a.createdAt || a.updatedAt || now).getTime();
        const bAge = now - new Date(b.createdAt || b.updatedAt || now).getTime();
        const aMonthScore = (a.likesCount || 0) * 2 + (a.viewsCount || 0) + (aAge < thirtyDays ? 30 : 0);
        const bMonthScore = (b.likesCount || 0) * 2 + (b.viewsCount || 0) + (bAge < thirtyDays ? 30 : 0);
        return bMonthScore - aMonthScore;
      });
    } else {
      // All-time: sorted strictly by total cumulative likes, then views
      list.sort((a, b) => {
        const diff = (b.likesCount || 0) - (a.likesCount || 0);
        if (diff !== 0) return diff;
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      });
    }

    return list;
  };

  const rankedProjects = getFilteredAndSortedProjects();
  const top3 = rankedProjects.slice(0, 3);
  const remaining = rankedProjects.slice(3);

  const getTrophyBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-400/30">
          🥇
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-300 text-slate-950 font-black text-sm shadow-md">
          🥈
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-700 text-white font-black text-sm shadow-md">
          🥉
        </span>
      );
    }
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-muted text-muted font-bold text-xs font-mono">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold mb-3 border border-amber-500/20">
          <Trophy className="h-3.5 w-3.5" />
          <span>{language === "ko" ? "Hall of Fame • 명예의 전당" : "Hall of Fame • Top Projects"}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
          {language === "ko" ? "주간 & 월간 명예의 전당" : "Weekly & Monthly Leaderboard"}
        </h1>
        <p className="text-xs md:text-sm text-muted mt-2">
          {language === "ko"
            ? "빌더 커뮤니티에서 가장 많은 응원과 사랑을 받은 최고의 사이드 프로젝트를 실시간으로 소개합니다."
            : "Discover the top-voted side projects created by passionate indie makers updated in real time."}
        </p>

        {/* Real-time Status Badge & Refresh */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>실시간 집계 중 (Live Sync)</span>
          </span>

          <button
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 text-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            title="실시간 랭킹 새로고침"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span className="text-[11px] font-mono">
              {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "방금 갱신됨"}
            </span>
          </button>
        </div>

        {/* Period Switcher */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-surface-muted p-1 mt-6 border border-border shadow-xs">
          <button
            onClick={() => setPeriod("weekly")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              period === "weekly"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {language === "ko" ? "이번 주 랭킹 🔥" : "This Week 🔥"}
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              period === "monthly"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {language === "ko" ? "이번 달 랭킹 ⭐" : "This Month ⭐"}
          </button>
          <button
            onClick={() => setPeriod("allTime")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              period === "allTime"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {language === "ko" ? "역대 명예의 전당 👑" : "All Time 👑"}
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-border bg-surface-muted/30 animate-pulse p-6" />
          ))}
        </div>
      ) : rankedProjects.length === 0 ? (
        /* Empty State */
        <div className="mt-12 rounded-card border border-dashed border-border bg-surface-muted/20 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Trophy className="h-6 w-6" />
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {period === "weekly" ? "이번 주" : period === "monthly" ? "이번 달" : "명예의 전당"} 첫 1위 프로젝트의 주인공이 되어보세요!
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              사이드 프로젝트를 등록하고 동료 빌더들에게 첫 응원 하트를 받아보세요.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>내 프로젝트 등록하고 1위 차지하기</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="order-2 md:order-1 rounded-2xl border border-slate-700/60 bg-surface p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute top-3 left-3">{getTrophyBadge(1)}</div>
                  <img
                    src={top3[1].logo || top3[1].coverImage || "/icon.svg"}
                    alt={top3[1].title}
                    className="h-16 w-16 rounded-2xl border border-border object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <h3 className="text-base font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
                    {top3[1].title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 mt-1">{top3[1].tagline}</p>
                  <div className="flex items-center gap-3 mt-4 text-xs font-bold">
                    <span className="text-rose-500">❤️ {top3[1].likesCount}</span>
                    <span className="text-muted">👀 {top3[1].viewsCount}</span>
                  </div>
                  <Link
                    href={`/projects/${top3[1].id}`}
                    className="mt-4 w-full rounded-xl border border-border py-2 text-xs font-semibold hover:bg-surface-muted transition-colors"
                  >
                    상세보기
                  </Link>
                </div>
              )}

              {/* 1st Place (Featured & Higher) */}
              {top3[0] && (
                <div className="order-1 md:order-2 rounded-2xl border-2 border-amber-400/80 bg-surface p-7 shadow-xl shadow-amber-400/10 flex flex-col items-center text-center relative overflow-hidden group -translate-y-2">
                  <div className="absolute top-3 left-3">{getTrophyBadge(0)}</div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-500">
                    <Crown className="h-3.5 w-3.5" />
                    <span>{period === "weekly" ? "주간 1위" : period === "monthly" ? "월간 1위" : "역대 1위"}</span>
                  </div>
                  <img
                    src={top3[0].logo || top3[0].coverImage || "/icon.svg"}
                    alt={top3[0].title}
                    className="h-20 w-20 rounded-2xl border-2 border-amber-400/50 object-cover shadow-md group-hover:scale-105 transition-transform"
                  />
                  <h3 className="text-lg font-black text-foreground mt-3 group-hover:text-amber-500 transition-colors">
                    {top3[0].title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 mt-1">{top3[0].tagline}</p>
                  <div className="flex items-center gap-4 mt-4 text-xs font-bold">
                    <span className="text-rose-500 text-sm">❤️ {top3[0].likesCount}</span>
                    <span className="text-muted text-sm">👀 {top3[0].viewsCount}</span>
                  </div>
                  <Link
                    href={`/projects/${top3[0].id}`}
                    className="mt-4 w-full rounded-xl bg-amber-400 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-400/30 hover:bg-amber-300 transition-colors"
                  >
                    1위 프로젝트 둘러보기 🚀
                  </Link>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="order-3 rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute top-3 left-3">{getTrophyBadge(2)}</div>
                  <img
                    src={top3[2].logo || top3[2].coverImage || "/icon.svg"}
                    alt={top3[2].title}
                    className="h-16 w-16 rounded-2xl border border-border object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <h3 className="text-base font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
                    {top3[2].title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 mt-1">{top3[2].tagline}</p>
                  <div className="flex items-center gap-3 mt-4 text-xs font-bold">
                    <span className="text-rose-500">❤️ {top3[2].likesCount}</span>
                    <span className="text-muted">👀 {top3[2].viewsCount}</span>
                  </div>
                  <Link
                    href={`/projects/${top3[2].id}`}
                    className="mt-4 w-full rounded-xl border border-border py-2 text-xs font-semibold hover:bg-surface-muted transition-colors"
                  >
                    상세보기
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Ranks 4+ List */}
          {remaining.length > 0 && (
            <div className="mt-10 rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border text-xs font-bold text-muted uppercase tracking-wider flex items-center justify-between bg-surface-muted/40">
                <span>랭킹 순위</span>
                <span>프로젝트 & 지표</span>
              </div>

              <div className="divide-y divide-border">
                {remaining.map((p, idx) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between p-4 hover:bg-surface-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 flex justify-center">{getTrophyBadge(idx + 3)}</div>
                      <img
                        src={p.logo || p.coverImage || "/icon.svg"}
                        alt={p.title}
                        className="h-10 w-10 rounded-xl border border-border object-cover group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-xs text-muted max-w-md truncate">{p.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-rose-500">❤️ {p.likesCount}</span>
                      <span className="text-muted hidden sm:inline-block">👀 {p.viewsCount}</span>
                      <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
