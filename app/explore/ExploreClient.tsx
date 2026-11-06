"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/lib/types";
import { getProjects, fetchSharedProjects } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = [
  "All",
  "AI",
  "SaaS",
  "Developer Tools",
  "Design",
  "Game",
  "Productivity",
  "Web",
  "Mobile",
  "Security",
];

const STATUSES = [
  "All",
  "Public",
  "Beta",
  "MVP",
  "Looking for Team",
  "Looking for Testers",
  "PH 런칭 워밍업",
  "매각/인수 가능 (For Sale)",
  "오픈소스 (Good First Issue)",
];

export default function ExploreClient({ initialProjects = [] }: { initialProjects?: Project[] }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "likes" | "updated">("popular");

  useEffect(() => {
    if (initialProjects.length === 0) {
      setProjects(getProjects());
    }
    fetchSharedProjects(user?.id).then(setProjects);

    const handleSync = () => fetchSharedProjects(user?.id).then(setProjects);
    window.addEventListener("lumio_data_synced", handleSync);
    return () => window.removeEventListener("lumio_data_synced", handleSync);
  }, [user?.id, initialProjects.length]);

  const filtered = projects.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.author?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedCategory !== "All") {
      if (!p.tags.includes(selectedCategory)) return false;
    }

    if (selectedStatus !== "All") {
      if (selectedStatus === "Looking for Team" && !p.lookingForTeam) return false;
      if (selectedStatus === "Looking for Testers" && !p.lookingForTesters) return false;
      if (selectedStatus === "PH 런칭 워밍업" && !p.isProductHuntWarmup) return false;
      if (selectedStatus === "매각/인수 가능 (For Sale)" && !p.isForSale) return false;
      if (selectedStatus === "오픈소스 (Good First Issue)" && !p.goodFirstIssuesCount) return false;
      if (
        selectedStatus !== "Looking for Team" &&
        selectedStatus !== "Looking for Testers" &&
        selectedStatus !== "PH 런칭 워밍업" &&
        selectedStatus !== "매각/인수 가능 (For Sale)" &&
        selectedStatus !== "오픈소스 (Good First Issue)" &&
        p.status !== selectedStatus
      ) {
        return false;
      }
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "likes") {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    if (sortBy === "updated") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return ((b.likesCount || 0) * 2 + (b.viewsCount || 0)) - ((a.likesCount || 0) * 2 + (a.viewsCount || 0));
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {language === "ko" ? "탐색 (Explore)" : "Explore Projects"}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {language === "ko"
            ? "다양한 카테고리의 흥미로운 사이드 프로젝트를 둘러보고 피드백을 남겨보세요."
            : "Discover fresh side projects across various tech domains and share your valuable feedback."}
        </p>
      </div>

      {/* Feature 14: Premium Spotlight Banner */}
      {projects.length > 0 && (() => {
        const spotlight = projects[0];
        return (
          <div className="mb-8 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-purple-500/10 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={spotlight.logo || spotlight.coverImage || "/icon.png"}
                alt={spotlight.title}
                className="h-14 w-14 rounded-xl object-cover border border-border shadow-sm shrink-0"
              />
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full mb-1">
                  <Sparkles className="h-3 w-3" />
                  Today's Sponsored Spotlight
                </span>
                <h3 className="text-base font-bold text-foreground">{spotlight.title}</h3>
                <p className="text-xs text-muted line-clamp-1">{spotlight.tagline}</p>
              </div>
            </div>
            <Link
              href={`/projects/${spotlight.id}`}
              className="rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors shrink-0"
            >
              스포트라이트 구경하기 →
            </Link>
          </div>
        );
      })()}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={
            language === "ko"
              ? "프로젝트명, 설명, 태그, 메이커 이름으로 검색..."
              : "Search by project name, description, tags, builder..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-[12px] border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
      </div>

      {/* Bootcamp & Cohort Collection Pills */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-semibold text-muted text-[11px] shrink-0">
          {language === "ko" ? "🎓 데모데이 쇼케이스 관:" : "🎓 Demo Day Showcase:"}
        </span>
        {[
          { label: language === "ko" ? "전체" : "All", tag: "All" },
          { label: "🦁 멋쟁이사자처럼 12기", tag: "LikeLion" },
          { label: "🚀 디프만 15기", tag: "Depromeet" },
          { label: "⚡ 스파르타 수료전", tag: "Sparta" },
          { label: "🎓 대학생 졸작/토이", tag: "Student" },
        ].map((cohort) => (
          <button
            key={cohort.label}
            onClick={() => {
              if (cohort.tag === "All") {
                setSearchQuery("");
                setSelectedCategory("All");
              } else {
                setSearchQuery(cohort.label.split(" ")[1] || cohort.tag);
              }
            }}
            className="rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-primary-soft hover:text-primary transition-colors shrink-0 cursor-pointer"
          >
            {cohort.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface text-muted border border-border hover:text-foreground hover:bg-surface-muted hover:border-border-strong"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
          {STATUSES.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`rounded-[8px] px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-surface-muted text-foreground font-semibold border border-border"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-[8px] border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="popular">인기순 (추천)</option>
            <option value="newest">최신 등록순</option>
            <option value="likes">좋아요 많은 순</option>
            <option value="updated">최근 업데이트순</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <span>
          총 <span className="font-semibold text-foreground">{sorted.length}</span>개의 프로젝트
        </span>
        {(searchQuery || selectedCategory !== "All" || selectedStatus !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}
            className="text-primary hover:underline cursor-pointer"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Project Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((proj) => (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[16px] border border-dashed border-border bg-surface-muted/30">
          <p className="text-sm font-medium text-muted">
            조건에 맞는 프로젝트를 찾을 수 없습니다.
          </p>
          <p className="mt-1 text-xs text-muted">
            다른 검색어나 카테고리 필터를 선택해 보세요.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}
            className="mt-4 rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            모든 필터 해제
          </button>
        </div>
      )}
    </div>
  );
}
