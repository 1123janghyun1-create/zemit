"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Users, ArrowUpRight } from "lucide-react";
import { Project } from "@/lib/types";
import { toggleProjectLike } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

interface FeaturedProjectProps {
  project: Project;
}

export default function FeaturedProject({ project }: FeaturedProjectProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(project.likesCount);
  const [isLiked, setIsLiked] = useState(project.isLiked || false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      if (confirm("좋아요를 누르려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }
    const result = toggleProjectLike(project.id);
    setLikesCount(result.likesCount);
    setIsLiked(result.isLiked);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pt-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        Featured Today
      </p>

      <Link
        href={`/projects/${project.id}`}
        className="group relative flex min-h-[180px] flex-col justify-end overflow-hidden rounded-[16px] border border-border p-5 shadow-card transition-shadow duration-200 hover:shadow-hover sm:min-h-[320px] sm:p-10"
      >
        {/* Blurred background / gradient */}
        <div
          className="absolute inset-0 scale-125 transition-transform duration-500 group-hover:scale-130"
          style={
            project.coverImage
              ? {
                  backgroundImage: `url(${project.coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(28px)",
                }
              : {
                  background: project.coverGradient
                    ? `linear-gradient(135deg, ${project.coverGradient[0]}, ${project.coverGradient[1]})`
                    : "linear-gradient(135deg, #22C55E, #0EA5E9)",
                }
          }
        />

        {/* Clean cover overlay */}
        {project.coverImage && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${project.coverImage})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}

        {/* Darkening gradient */}
        <div className="absolute inset-0 bg-black/45 transition-opacity duration-200 group-hover:bg-black/35" />

        {/* Content */}
        <div className="relative flex flex-col gap-2 text-white sm:gap-4">
          <div className="flex items-center gap-2">
            {project.logo ? (
              <img
                src={project.logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded-[10px] border border-white/40 object-cover shadow-sm sm:h-10 sm:w-10 bg-white"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/90 text-sm font-semibold text-gray-900 shadow-sm sm:h-10 sm:w-10">
                {(project.title || "P").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-white/90 text-success shadow-sm">
              {project.status}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-4xl text-white">
              {project.title}
            </h2>
            <p className="mt-1 line-clamp-1 max-w-xl text-sm text-white/90 sm:mt-2 sm:line-clamp-none sm:text-base">
              {project.tagline}
            </p>
          </div>

          <div className="hidden flex-wrap items-center gap-4 text-sm text-white/90 sm:flex">
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-danger text-danger" : ""}`} />
              <span>{likesCount}</span>
            </button>

            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{project.followersCount} followers</span>
            </span>

            <span className="flex min-w-0 items-center gap-1.5">
              <img
                src={project.author.avatar}
                alt={project.author.name}
                className="h-5 w-5 shrink-0 rounded-full object-cover border border-white/40"
              />
              <span className="min-w-0 truncate font-medium">
                {project.author.name}
              </span>
            </span>
          </div>

          <span className="mt-1 flex w-fit items-center gap-1.5 rounded-[12px] bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 transition-transform duration-200 group-hover:translate-x-0.5 sm:mt-2 sm:px-4 sm:py-2 sm:text-sm">
            View Project
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </section>
  );
}

