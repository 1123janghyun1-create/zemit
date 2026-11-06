"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Users, Trash2 } from "lucide-react";
import { Project } from "@/lib/types";
import { toggleProjectLike, isProjectLiked, deleteProject } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

interface ProjectCardProps {
  project: Project;
  onLikeChanged?: (projectId: string, count: number, isLiked: boolean) => void;
}

export default function ProjectCard({ project, onLikeChanged }: ProjectCardProps) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [likesCount, setLikesCount] = useState(project.likesCount);
  const [isLiked, setIsLiked] = useState(() => isProjectLiked(project.id) || project.isLiked || false);

  const canDelete = Boolean(isAdmin || (user && (user.id === project.author?.id || user.handle === project.author?.handle)));

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canDelete) return;
    if (confirm(`'${project.title}' 프로젝트를 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다.`)) {
      deleteProject(project.id);
      window.dispatchEvent(new CustomEvent("lumio_data_synced"));
    }
  };

  useEffect(() => {
    setLikesCount(project.likesCount);
    const storedLiked = isProjectLiked(project.id);
    setIsLiked(storedLiked || project.isLiked || false);
  }, [project.id, project.likesCount, project.isLiked]);

  useEffect(() => {
    const handleLikeEvent = (e: any) => {
      if (e.detail?.projectId === project.id) {
        setLikesCount(e.detail.likesCount);
        setIsLiked(e.detail.isLiked);
      }
    };
    window.addEventListener("lumio_like_changed", handleLikeEvent);
    return () => window.removeEventListener("lumio_like_changed", handleLikeEvent);
  }, [project.id]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (confirm("좋아요를 누르려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }
    const result = toggleProjectLike(project.id, user.id);
    setLikesCount(result.likesCount);
    setIsLiked(result.isLiked);
    if (onLikeChanged) {
      onLikeChanged(project.id, result.likesCount, result.isLiked);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Public":
        return "bg-success-soft text-success border border-success/20";
      case "Beta":
        return "bg-warning-soft text-warning border border-warning/20";
      default:
        return "bg-surface-muted text-muted border border-border";
    }
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-[16px] border border-border bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
    >
      {/* Mobile Card Layout */}
      <div className="flex items-center gap-3 p-3 sm:hidden">
        {project.logo ? (
          <img
            src={project.logo}
            alt={project.title}
            className="h-14 w-14 shrink-0 rounded-[12px] border border-border object-cover"
          />
        ) : (
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] text-lg font-bold text-white shadow-sm"
            style={{
              background: project.coverGradient
                ? `linear-gradient(135deg, ${project.coverGradient[0]}, ${project.coverGradient[1]})`
                : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            }}
          >
            {(project.title || "P").slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {project.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted">
            {project.tagline}
          </p>
          <div className="mt-1.5 flex flex-col gap-1 text-xs text-muted">
            <div
              className="flex min-w-0 items-center gap-1.5 cursor-pointer hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/builders/${project.author?.id || project.author?.handle || ""}`);
              }}
            >
              {project.author?.avatar && (
                <img
                  src={project.author.avatar}
                  alt={project.author.name}
                  className="h-4 w-4 shrink-0 rounded-full object-cover border border-border"
                />
              )}
              <span className="min-w-0 truncate font-medium hover:underline">{project.author?.name || "Maker"}</span>
              {project.author?.isStartingMember && (
                <span className="rounded-full border border-border bg-surface-muted px-1.5 py-0.5 text-[9px] font-medium leading-none text-muted">
                  Starting Member
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleLike}
                className={`flex shrink-0 items-center gap-1 cursor-pointer transition-colors ${
                  isLiked ? "text-rose-500 font-semibold" : "text-muted hover:text-foreground"
                }`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{likesCount}</span>
              </button>
              <span className="flex shrink-0 items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{project.commentsCount + project.feedbacksCount}</span>
              </span>
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1 text-muted hover:text-danger hover:bg-danger-soft rounded transition-colors cursor-pointer"
                  title={isAdmin ? "프로젝트 강제 삭제 (관리자)" : "프로젝트 삭제"}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Card Layout */}
      <div
        className="relative hidden aspect-video items-end gap-2 overflow-hidden p-4 sm:flex"
        style={
          project.coverImage
            ? undefined
            : {
                background: project.coverGradient
                  ? `linear-gradient(135deg, ${project.coverGradient[0]}, ${project.coverGradient[1]})`
                  : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              }
        }
      >
        {project.coverImage && (
          <img
            src={project.coverImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

        {/* Small Logo */}
        {project.logo ? (
          <img
            src={project.logo}
            alt={project.title}
            loading="lazy"
            className="relative h-9 w-9 shrink-0 rounded-[10px] border border-white/40 object-cover shadow-sm bg-surface"
          />
        ) : (
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/90 text-sm font-semibold text-gray-900 shadow-sm">
            {(project.title || "P").slice(0, 1).toUpperCase()}
          </span>
        )}

        {/* Status Badge */}
        <span
          className={`relative inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/90 shadow-sm ${
            project.status === "Public"
              ? "text-success"
              : project.status === "Beta"
              ? "text-warning"
              : "text-muted"
          }`}
        >
          {project.status}
        </span>
      </div>

      <div className="hidden flex-1 flex-col gap-3 p-5 sm:flex">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted">
            {project.tagline}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-muted border border-border/60 px-2.5 py-0.5 text-[11px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="rounded-full bg-surface-muted border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted">
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {/* Footer info & stats */}
        <div className="mt-auto flex items-center gap-2.5 pt-2 border-t border-border/50">
          <div
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/builders/${project.author?.id || project.author?.handle || ""}`);
            }}
          >
            <div className="flex shrink-0">
              <img
                src={project.author.avatar}
                alt={project.author.name}
                className="h-8 w-8 shrink-0 rounded-full border border-border object-cover"
              />
            </div>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted hover:underline hover:text-foreground">
              {project.author.name}
            </span>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            {project.author.isStartingMember && (
              <span className="rounded-full border border-border bg-surface-muted px-1.5 py-0.5 text-[9px] font-medium leading-none text-muted">
                Starting Member
              </span>
            )}

            <div className="flex items-center gap-2.5 text-xs text-muted">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  isLiked ? "text-rose-500 font-semibold" : "hover:text-foreground"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{likesCount}</span>
              </button>

              <span className="flex items-center gap-1" title="피드백 및 댓글">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{project.commentsCount + project.feedbacksCount}</span>
              </span>

              <span className="flex items-center gap-1" title="팔로워">
                <Users className="h-3.5 w-3.5" />
                <span>{project.followersCount}</span>
              </span>

              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1 text-muted hover:text-danger hover:bg-danger-soft rounded transition-colors cursor-pointer ml-auto"
                  title={isAdmin ? "프로젝트 강제 삭제 (관리자)" : "프로젝트 삭제"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

