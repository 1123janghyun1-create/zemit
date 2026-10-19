"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Globe, Users, Heart, Layers } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/Icons";
import { Builder } from "@/lib/types";
import { getBuilders, toggleFollowBuilder, upsertBuilder, fetchSharedBuilders } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function BuildersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const loadAllBuilders = async () => {
    // 1. Fetch from shared server API
    const shared = await fetchSharedBuilders();
    let currentList = [...shared];

    // Ensure currently logged-in user is included and synced
    if (user) {
      const idx = currentList.findIndex((b) => b.id === user.id);
      if (idx >= 0) {
        const preservedFollowers = currentList[idx].followersCount ?? user.followersCount ?? 0;
        currentList[idx] = { ...currentList[idx], ...user, followersCount: preservedFollowers };
      } else {
        currentList = [{ ...user, followersCount: user.followersCount ?? 0 }, ...currentList];
      }
      upsertBuilder(currentList[idx >= 0 ? idx : 0]);
    }

    setBuilders(currentList);

    // 2. Also query Supabase profiles table for any newly registered remote users
    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await (supabase as any).from("profiles").select("*");
        if (!error && data && data.length > 0) {
          const remoteBuilders: Builder[] = data.map((p: any) => ({
            id: p.id,
            name: p.name || "Maker",
            handle: p.handle || "maker",
            avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
            bio: p.bio || "zemit 메이커",
            role: p.role || "Maker",
            isStartingMember: p.is_starting_member ?? true,
            socials: {
              github: p.github_url,
              twitter: p.twitter_url,
              website: p.website_url,
            },
          }));

          setBuilders((prev) => {
            const map = new Map<string, Builder>();
            prev.forEach((b) => map.set(b.id, b));
            remoteBuilders.forEach((b) => {
              const existing = map.get(b.id);
              map.set(b.id, {
                ...existing,
                ...b,
                followersCount: existing?.followersCount ?? b.followersCount ?? 0,
                isFollowing: existing?.isFollowing ?? b.isFollowing ?? false,
              });
            });
            if (user) {
              const existing = map.get(user.id);
              map.set(user.id, {
                ...existing,
                ...user,
                followersCount: existing?.followersCount ?? user.followersCount ?? 0,
                isFollowing: false,
              });
            }
            const merged = Array.from(map.values());
            merged.forEach((b) => upsertBuilder(b));
            return merged;
          });
        }
      } catch {}
    }
  };

  useEffect(() => {
    loadAllBuilders();

    const handleSync = () => loadAllBuilders();
    window.addEventListener("lumio_data_synced", handleSync);
    return () => window.removeEventListener("lumio_data_synced", handleSync);
  }, [user]);

  const handleFollow = (builderId: string) => {
    if (!user) {
      if (confirm("빌더를 팔로우하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login?redirect=/builders");
      }
      return;
    }
    const result = toggleFollowBuilder(builderId);
    setBuilders((prev) =>
      prev.map((b) =>
        b.id === builderId
          ? {
              ...b,
              isFollowing: result.isFollowing,
              followersCount: result.followersCount,
            }
          : b
      )
    );
  };

  // Dynamically compute roles from actual builders
  const dynamicRoles = ["All", ...Array.from(new Set(builders.map((b) => b.role).filter(Boolean)))];

  const filtered = builders.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.handle && b.handle.toLowerCase().includes(q)) ||
        (b.bio && b.bio.toLowerCase().includes(q)) ||
        (b.role && b.role.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (selectedRole !== "All" && b.role !== selectedRole) {
      return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          빌더들 (Builders)
        </h1>
        <p className="mt-1 text-sm text-muted">
          Zemit에서 사이드 프로젝트를 만들고 키워나가는 메이커들을 만나보세요.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="이름, 핸들, 역할, 소개글 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[12px] border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        {dynamicRoles.length > 2 && (
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-[12px] border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none shadow-sm cursor-pointer"
          >
            {dynamicRoles.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "모든 직군" : r}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Builders Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((builder) => (
            <div
              key={builder.id}
              className="flex flex-col justify-between rounded-card border border-border bg-surface p-6 shadow-card hover:shadow-hover transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={builder.avatar}
                      alt={builder.name}
                      className="h-14 w-14 rounded-full border border-border object-cover"
                    />
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">
                        {builder.name}
                      </h3>
                      <p className="text-xs text-muted">@{builder.handle}</p>
                      <span className="inline-block rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted mt-1">
                        {builder.role}
                      </span>
                    </div>
                  </div>

                  {builder.isStartingMember && (
                    <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[9px] font-semibold text-muted shrink-0">
                      Starting Member
                    </span>
                  )}
                </div>

                <p className="mt-4 text-xs text-muted leading-relaxed line-clamp-3">
                  {builder.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between text-xs text-muted mb-4">
                  <span className="flex items-center gap-1" title="등록한 프로젝트 수">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{builder.projectsCount || 0} 프로젝트</span>
                  </span>
                  <span className="flex items-center gap-1" title="받은 총 좋아요">
                    <Heart className="h-3.5 w-3.5 text-danger" />
                    <span>{builder.totalLikes || 0}</span>
                  </span>
                  <span className="flex items-center gap-1" title="팔로워">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{builder.followersCount || 0}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFollow(builder.id)}
                    className={`flex-1 rounded-control py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      builder.isFollowing
                        ? "bg-surface-muted text-muted hover:text-foreground border border-border"
                        : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm"
                    }`}
                  >
                    {builder.isFollowing ? "팔로잉 중" : "+ 팔로우"}
                  </button>

                  {builder.socials?.github && (
                    <a
                      href={builder.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-muted hover:text-foreground hover:bg-surface-muted"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {builder.socials?.website && (
                    <a
                      href={builder.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-muted hover:text-foreground hover:bg-surface-muted"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-card border border-dashed border-border bg-surface-muted/20 px-6">
          <p className="text-sm font-semibold text-foreground">
            아직 등록된 빌더가 없습니다
          </p>
          <p className="mt-1 text-xs text-muted">
            로그인하고 프로젝트를 공유하여 첫 번째 빌더가 되어보세요!
          </p>
          <Link
            href="/login"
            className="mt-4 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
          >
            로그인하기
          </Link>
        </div>
      )}
    </div>
  );
}

