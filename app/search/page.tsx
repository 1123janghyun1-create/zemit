"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Layers, Users, MessageSquare } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { Project, Builder, CommunityPost } from "@/lib/types";
import { getProjects, getBuilders, getCommunityPosts } from "@/lib/storage";

type SearchFilter = "all" | "projects" | "builders" | "community";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    setProjects(getProjects());
    setBuilders(getBuilders());
    setPosts(getCommunityPosts());
  }, []);

  const q = query.toLowerCase().trim();

  const matchingProjects = q
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    : [];

  const matchingBuilders = q
    ? builders.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.handle.toLowerCase().includes(q) ||
          b.bio.toLowerCase().includes(q) ||
          b.role.toLowerCase().includes(q)
      )
    : [];

  const matchingPosts = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchingProjects.length + matchingBuilders.length + matchingPosts.length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          통합 검색 (Search)
        </h1>
        <p className="mt-1 text-sm text-muted">
          프로젝트, 빌더, 커뮤니티 게시글을 한번에 찾아보세요.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          placeholder="검색어를 입력하세요 (예: AI, 세포전, SaaS, 줌덕잉)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-card border border-border bg-surface py-3.5 pl-12 pr-10 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 mb-8 overflow-x-auto scrollbar-none">
        {[
          { key: "all", label: `전체 (${totalResults})` },
          { key: "projects", label: `프로젝트 (${matchingProjects.length})` },
          { key: "builders", label: `빌더 (${matchingBuilders.length})` },
          { key: "community", label: `커뮤니티 (${matchingPosts.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as SearchFilter)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              filter === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface-muted text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!q ? (
        <div className="py-12 max-w-xl mx-auto space-y-6">
          <div className="rounded-card border border-border bg-surface p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="text-rose-500">🔥</span>
                <span>실시간 인기 검색어 & 급상승 키워드</span>
              </h3>
              <span className="text-[10px] text-muted font-mono">LIVE RANKING</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { rank: 1, tag: "AI 에이전트", hot: true },
                { rank: 2, tag: "Next.js 15", hot: true },
                { rank: 3, tag: "Supabase", hot: false },
                { rank: 4, tag: "마이크로 SaaS", hot: true },
                { rank: 5, tag: "크롬 확장프로그램", hot: false },
                { rank: 6, tag: "Tailwind v4", hot: false },
                { rank: 7, tag: "오픈소스", hot: false },
                { rank: 8, tag: "사이드 프로젝트", hot: false },
              ].map((item) => (
                <button
                  key={item.tag}
                  onClick={() => setQuery(item.tag)}
                  className="flex items-center justify-between rounded-control border border-border bg-surface-muted/40 px-3 py-2 text-xs text-foreground hover:bg-surface-muted hover:border-primary/40 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${item.rank <= 3 ? "text-primary" : "text-muted"}`}>
                      {item.rank}
                    </span>
                    <span className="group-hover:text-primary transition-colors">{item.tag}</span>
                  </div>
                  {item.hot && (
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.2 rounded">
                      HOT
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-20 text-muted rounded-card border border-dashed border-border">
          <p className="text-sm font-medium">'{query}'에 대한 검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Projects Results */}
          {(filter === "all" || filter === "projects") && matchingProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  프로젝트 ({matchingProjects.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {matchingProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}

          {/* Builders Results */}
          {(filter === "all" || filter === "builders") && matchingBuilders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  빌더 ({matchingBuilders.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingBuilders.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-sm"
                  >
                    <img
                      src={b.avatar}
                      alt={b.name}
                      className="h-12 w-12 rounded-full border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-foreground truncate">{b.name}</h4>
                      <p className="text-xs text-muted truncate">@{b.handle}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{b.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Results */}
          {(filter === "all" || filter === "community") && matchingPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  커뮤니티 글 ({matchingPosts.length})
                </h2>
              </div>
              <div className="space-y-3">
                {matchingPosts.map((post) => (
                  <Link
                    key={post.id}
                    href="/community"
                    className="block rounded-card border border-border bg-surface p-4 hover:shadow-card transition-shadow"
                  >
                    <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 text-[10px] font-bold">
                      {post.category}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground mt-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {post.content}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

