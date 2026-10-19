"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Heart, MessageSquare, ThumbsUp, Layers, ExternalLink } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { Project, FeedbackItem, CommentItem } from "@/lib/types";
import { getProjects, getFeedbacksByProject } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { formatRelativeTime } from "@/lib/utils";

type ActivityTab = "my_projects" | "liked" | "feedbacks" | "comments";

export default function ActivityPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActivityTab>("my_projects");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/activity");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted">로그인 확인 중...</p>
      </div>
    );
  }

  const myProjects = projects.filter((p) => p.author.id === user?.id || p.author.name === user?.name);
  const likedProjects = projects.filter((p) => p.isLiked);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          내 활동 (My Activity)
        </h1>
        <p className="mt-1 text-sm text-muted">
          내가 등록한 프로젝트, 좋아요 목록, 남긴 피드백과 댓글을 한곳에서 모아봅니다.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-8 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "my_projects", label: `내 프로젝트 (${myProjects.length})` },
          { key: "liked", label: `좋아요한 프로젝트 (${likedProjects.length})` },
          { key: "feedbacks", label: "남긴 피드백" },
          { key: "comments", label: "작성한 댓글" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as ActivityTab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === tab.key
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MY PROJECTS */}
      {activeTab === "my_projects" && (
        <div>
          {myProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {myProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-[16px] border border-dashed border-border bg-surface-muted/30">
              <Layers className="h-10 w-10 text-muted mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                아직 등록한 프로젝트가 없습니다
              </h3>
              <p className="mt-1 text-xs text-muted max-w-xs">
                만들고 계신 사이드 프로젝트나 MVP를 등록하고 첫 유저들의 피드백을 받아보세요.
              </p>
              <Link
                href="/projects/new"
                className="mt-4 flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" />
                새 프로젝트 등록하기
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIKED */}
      {activeTab === "liked" && (
        <div>
          {likedProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {likedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-[16px] border border-dashed border-border bg-surface-muted/30">
              <Heart className="h-10 w-10 text-muted mb-3" />
              <p className="text-sm font-medium text-muted">
                아직 좋아요를 누른 프로젝트가 없습니다.
              </p>
              <Link href="/explore" className="mt-3 text-xs font-semibold text-primary hover:underline">
                프로젝트 둘러보기 →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FEEDBACKS */}
      {activeTab === "feedbacks" && (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[16px] border border-dashed border-border bg-surface-muted/30">
          <ThumbsUp className="h-10 w-10 text-muted mb-3" />
          <p className="text-sm font-medium text-muted">
            아직 작성한 피드백이 없습니다.
          </p>
          <p className="mt-1 text-xs text-muted max-w-xs">
            다른 메이커들의 프로젝트를 살펴보고 유용한 피드백을 남겨보세요.
          </p>
          <Link href="/explore" className="mt-4 text-xs font-semibold text-primary hover:underline">
            프로젝트 둘러보기 →
          </Link>
        </div>
      )}

      {/* TAB 4: COMMENTS */}
      {activeTab === "comments" && (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[16px] border border-dashed border-border bg-surface-muted/30">
          <MessageSquare className="h-10 w-10 text-muted mb-3" />
          <p className="text-sm font-medium text-muted">
            아직 작성한 댓글이 없습니다.
          </p>
          <p className="mt-1 text-xs text-muted max-w-xs">
            프로젝트와 커뮤니티에서 메이커들과 대화를 나눠보세요.
          </p>
          <Link href="/explore" className="mt-4 text-xs font-semibold text-primary hover:underline">
            프로젝트 둘러보기 →
          </Link>
        </div>
      )}
    </div>
  );
}

