"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bookmark, Heart, Sparkles, FolderHeart, ArrowRight, Plus } from "lucide-react";
import { getCollections, getProjects } from "@/lib/storage";
import { CuratedCollection, Project } from "@/lib/types";

export default function CollectionsClient() {
  const [collections] = useState<CuratedCollection[]>(getCollections());
  const [projects] = useState<Project[]>(getProjects());
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="border-b border-border bg-surface-muted/30 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <FolderHeart className="h-3.5 w-3.5" />
            <span>빌더 큐레이션 쇼케이스</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            명예의 전당 골든 컬렉션
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted max-w-2xl mx-auto">
            인디 빌더 커뮤니티가 엄선한 주제별 최고의 사이드 프로젝트 모음집입니다. 영감을 얻고 기술 스택을 탐색해 보세요.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <main className="mx-auto max-w-5xl px-6 pt-10 space-y-10">
        {collections.map((col) => (
          <div
            key={col.id}
            className="rounded-card border border-border bg-surface overflow-hidden shadow-card transition-all"
          >
            {/* Header Banner */}
            <div
              className="p-6 md:p-8 text-white relative"
              style={{
                background: `linear-gradient(135deg, ${col.bannerGradient[0]}, ${col.bannerGradient[1]})`,
              }}
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold opacity-90 mb-2">
                  <span>큐레이터: {col.curator.name}</span>
                  <span>•</span>
                  <span>{col.curator.role}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight">{col.title}</h2>
                <p className="mt-2 text-xs md:text-sm opacity-90 leading-relaxed">{col.tagline}</p>
              </div>

              <button
                onClick={() => handleLike(col.id)}
                className="mt-4 md:mt-0 md:absolute md:top-8 md:right-8 inline-flex items-center gap-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5 text-rose-400 fill-current" />
                <span>{col.likesCount + (likes[col.id] || 0)}</span>
              </button>
            </div>

            {/* Included Projects List or Empty notice */}
            <div className="p-6">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="rounded-xl border border-border bg-surface-muted/40 p-4 hover:border-primary/50 transition-all flex items-center gap-3 group"
                    >
                      <img
                        src={p.logo || p.coverImage || "/icon.png"}
                        alt={p.title}
                        className="h-10 w-10 rounded-lg object-cover border border-border shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {p.title}
                        </h4>
                        <p className="text-[11px] text-muted truncate">{p.tagline}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted">
                  zemix에 등록된 최신 프로젝트들이 이 컬렉션에 실시간으로 매칭됩니다.
                  <div className="mt-3">
                    <Link
                      href="/explore"
                      className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>프로젝트 탐색하기</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
