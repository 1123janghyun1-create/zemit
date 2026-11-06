"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Play } from "lucide-react";
import { HexagonLogo } from "@/components/Icons";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectCard from "@/components/ProjectCard";
import DemoVideoModal from "@/components/DemoVideoModal";
import { Project } from "@/lib/types";
import { getProjects, fetchSharedProjects } from "@/lib/storage";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function HomeClient({ initialProjects = [] }: { initialProjects?: Project[] }) {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Popular");
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  useEffect(() => {
    // If local storage has projects, check them; then fetch shared with user.id
    if (initialProjects.length === 0) {
      setProjects(getProjects());
    }
    fetchSharedProjects(user?.id).then(setProjects);

    const handleSync = () => fetchSharedProjects(user?.id).then(setProjects);
    window.addEventListener("lumio_data_synced", handleSync);
    return () => window.removeEventListener("lumio_data_synced", handleSync);
  }, [user?.id, initialProjects.length]);

  const filterButtons = [
    { label: t("filter.popular"), key: "Popular" },
    { label: t("filter.newest"), key: "Newest" },
    { label: t("filter.mostLiked"), key: "Most Liked" },
    { label: t("filter.recentlyUpdated"), key: "Recently Updated" },
    { label: t("filter.lookingForTesters"), key: "Looking for Testers" },
    { label: t("filter.lookingForTeam"), key: "Looking for Team" },
  ];

  // Filter and sort logic
  const filteredProjects = projects.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTagline = p.tagline.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      const matchAuthor = p.author?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchTagline && !matchTags && !matchAuthor) {
        return false;
      }
    }

    if (activeFilter === "Looking for Testers") {
      return p.lookingForTesters;
    }
    if (activeFilter === "Looking for Team") {
      return p.lookingForTeam;
    }

    return true;
  });

  // Sort
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (activeFilter === "Newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (activeFilter === "Most Liked") {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    if (activeFilter === "Recently Updated") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    // Default Popular
    return ((b.likesCount || 0) * 2 + (b.viewsCount || 0)) - ((a.likesCount || 0) * 2 + (a.viewsCount || 0));
  });

  // Featured project (the one flagged or first one)
  const featured = projects.find((p) => p.isFeatured) || projects[0];

  return (
    <div className="animate-fade-in pb-12">
      {/* Brand Hero Header */}
      <section className="mx-auto max-w-7xl px-6 pt-6 pb-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <span>zemix</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {t("hero.badge")}
              </span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              {t("hero.tagline")}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowDemoVideo(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-indigo-500 to-purple-600 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
            >
              <Play className="h-3.5 w-3.5 fill-white text-white group-hover:scale-110 transition-transform" />
              <span>🎬 1분 시연 영상 (Demo Video)</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                ENG
              </span>
            </button>
            <Link
              href="/about"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline px-2 py-2"
            >
              {t("hero.banner")}
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile About Banner */}
      <Link
        href="/about"
        className="block border-b border-border bg-surface-muted px-6 py-2.5 text-center text-sm font-medium text-primary md:hidden"
      >
        {t("hero.banner")}
      </Link>

      {/* Search & Filter Bar */}
      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[12px] border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filterButtons.map((btn) => {
            const isActive = activeFilter === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => setActiveFilter(btn.key)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface text-muted border border-border hover:text-foreground hover:bg-surface-muted hover:border-border-strong"
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Project */}
      {featured && !searchQuery && activeFilter === "Popular" && (
        <FeaturedProject project={featured} />
      )}

      {/* All Projects Section */}
      <section className="mx-auto max-w-7xl border-t border-border px-6 py-8 mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("all.title")}
          </p>
          <span className="text-xs text-muted">
            {language === "ko" ? `${sortedProjects.length}개의 프로젝트` : `${sortedProjects.length} projects`}
          </span>
        </div>

        {sortedProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sortedProjects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onLikeChanged={(id, count) => {
                  setProjects((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, likesCount: count } : p))
                  );
                }}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-card border border-dashed border-border bg-surface-muted/20 px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-surface border border-border shadow-sm mb-4">
              <HexagonLogo className="h-6 w-6 text-foreground" strokeWidth={2.2} />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {t("empty.noProjects")}
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-muted leading-relaxed">
              {t("empty.registerFirst")}
            </p>
            <Link
              href="/projects/new"
              className="mt-5 inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("btn.newProject")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-[16px] border border-dashed border-border bg-surface-muted/30">
            <p className="text-sm font-medium text-muted">
              {language === "ko" ? "검색 조건에 일치하는 프로젝트가 없습니다." : "No projects match your search criteria."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("Popular");
              }}
              className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              {language === "ko" ? "필터 초기화" : "Reset Filters"}
            </button>
          </div>
        )}
      </section>

      {/* SEO & Platform Guide Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-t border-border mt-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-3">
            About zemix
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            사이드 프로젝트 런칭과 유저 피드백의 모든 것, zemix
          </h2>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            zemix(제믹스)는 1인 개발자, 인디해커, 기획자, 디자이너들이 사이드 프로젝트를 세상에 선보이고,
            실제 사용자의 피드백을 수집하며 함께할 동료를 찾는 공식 메이커 커뮤니티 플랫폼입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
              🚀
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">
              초기 사용자 유치 및 런칭
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              아이디어를 실제 서비스로 배포하고, zemix 커뮤니티를 통해 초기 얼리어답터 유저를 확보하여 의미 있는 지표를 만들어보세요.
            </p>
          </div>

          <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg mb-4">
              💬
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">
              정밀한 피드백 수집
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              버그 리포트, 기능 제안, UX 개선점 등 동료 메이커들의 생생한 피드백을 통해 서비스를 한 단계 더 빠르게 진화시킬 수 있습니다.
            </p>
          </div>

          <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
              👥
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">
              팀원 모집 및 빌더 네트워킹
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              프론트엔드, 백엔드 개발자, UI/UX 디자이너, 마케터 등 프로젝트를 함께 키워나갈 열정적인 파트너를 찾아보세요.
            </p>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto rounded-card border border-border bg-surface p-6 sm:p-8">
          <h3 className="text-lg font-bold text-foreground mb-4">자주 묻는 질문 (FAQ)</h3>
          <div className="space-y-4 text-xs sm:text-sm">
            <details className="group border-b border-border/60 pb-3 cursor-pointer">
              <summary className="font-semibold text-foreground flex items-center justify-between list-none">
                <span>Q. zemix에 프로젝트를 등록하는 데 비용이 드나요?</span>
                <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-muted leading-relaxed">
                아니요, zemix의 프로젝트 등록, 피드백 수집, 팀원 모집, 빌더 프로필 개설 등 모든 핵심 기능은 100% 무료로 제공됩니다.
              </p>
            </details>

            <details className="group border-b border-border/60 pb-3 cursor-pointer">
              <summary className="font-semibold text-foreground flex items-center justify-between list-none">
                <span>Q. 아직 완성되지 않은 아이디어도 올릴 수 있나요?</span>
                <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-muted leading-relaxed">
                네! 아이디어 단계(Idea), 현재 개발 중인 상태(Building), 베타 테스트(Beta), 정식 런칭(Public) 등 모든 개발 단계의 프로젝트를 자유롭게 등록하고 의견을 나눌 수 있습니다.
              </p>
            </details>

            <details className="group pb-1 cursor-pointer">
              <summary className="font-semibold text-foreground flex items-center justify-between list-none">
                <span>Q. 구글 등 검색 엔진에 내 프로젝트가 노출되나요?</span>
                <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-muted leading-relaxed">
                네, zemix는 고도화된 SEO 최적화와 실시간 sitemap.xml, Schema.org 구조화 데이터를 지원하여 프로젝트를 등록하면 구글봇이 자동으로 크롤링하여 검색 결과에 노출되도록 돕습니다.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Official Product Demo Video Modal */}
      <DemoVideoModal
        isOpen={showDemoVideo}
        onClose={() => setShowDemoVideo(false)}
      />
    </div>
  );
}
