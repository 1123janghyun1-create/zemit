"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/lib/types";
import { getProjects, fetchSharedProjects } from "@/lib/storage";

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
];

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "likes" | "updated">("popular");

  useEffect(() => {
    setProjects(getProjects());
    fetchSharedProjects().then(setProjects);

    const handleSync = () => fetchSharedProjects().then(setProjects);
    window.addEventListener("lumio_data_synced", handleSync);
    return () => window.removeEventListener("lumio_data_synced", handleSync);
  }, []);

  const filtered = projects.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.author.name.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedCategory !== "All") {
      if (!p.tags.includes(selectedCategory)) return false;
    }

    if (selectedStatus !== "All") {
      if (selectedStatus === "Looking for Team" && !p.lookingForTeam) return false;
      if (selectedStatus === "Looking for Testers" && !p.lookingForTesters) return false;
      if (
        selectedStatus !== "Looking for Team" &&
        selectedStatus !== "Looking for Testers" &&
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
      return b.likesCount - a.likesCount;
    }
    if (sortBy === "updated") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return b.likesCount * 2 + b.viewsCount - (a.likesCount * 2 + a.viewsCount);
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          탐색 (Explore)
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Zemit에 올라온 다양한 사이드 프로젝트를 검색하고 필터링해보세요.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="프로젝트명, 설명, 태그, 메이커 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[12px] border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-muted hidden sm:inline">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-[12px] border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="popular">인기순 (Trending)</option>
            <option value="newest">최신순 (Newest)</option>
            <option value="likes">좋아요순 (Most Liked)</option>
            <option value="updated">최근 업데이트 (Updated)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface text-muted border border-border hover:text-foreground hover:bg-surface-muted hover:border-border-strong"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-8 flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground mr-2 shrink-0 flex items-center gap-1">
          <SlidersHorizontal className="h-3 w-3" /> 상태:
        </span>
        {STATUSES.map((st) => {
          const isSelected = selectedStatus === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`shrink-0 rounded-[8px] px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                isSelected
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-medium text-muted">
          총 <span className="font-semibold text-foreground">{sorted.length}</span>개의 프로젝트
        </p>
      </div>

      {/* Grid */}
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
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-card border border-dashed border-border bg-surface-muted/20 px-6">
          <p className="text-sm font-semibold text-foreground">
            등록된 프로젝트가 없습니다
          </p>
          <p className="mt-1 text-xs text-muted">
            첫 번째 프로젝트를 등록해보세요!
          </p>
          <Link
            href="/projects/new"
            className="mt-4 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
          >
            프로젝트 등록하기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-[16px] border border-dashed border-border bg-surface-muted/30">
          <p className="text-sm font-medium text-muted">
            해당 조건의 프로젝트를 찾을 수 없습니다.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}
            className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            모든 필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}

