"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Globe, Users, Layers, UserX, Trash2, Briefcase, Mail } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { Builder } from "@/lib/types";
import { getBuilders, toggleFollowBuilder, fetchSharedBuilders, banUser, unbanUser, deleteBuilder } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { isUserAdmin } from "@/lib/auth";

export default function BuildersClient({ initialBuilders = [] }: { initialBuilders?: Builder[] }) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [builders, setBuilders] = useState<Builder[]>(initialBuilders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [openToWorkOnly, setOpenToWorkOnly] = useState(false);
  const [scoutTarget, setScoutTarget] = useState<Builder | null>(null);
  const [scoutSent, setScoutSent] = useState(false);

  const handleToggleBan = (builder: Builder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    const nextStatus = !builder.isBanned;
    const actionText = nextStatus ? "밴(활동 정지)" : "밴 해제";
    if (confirm(`'${builder.name}' (@${builder.handle}) 메이커를 ${actionText} 처리하시겠습니까?`)) {
      if (nextStatus) {
        banUser(builder.id);
      } else {
        unbanUser(builder.id);
      }
      setBuilders((prev) =>
        prev.map((b) => (b.id === builder.id ? { ...b, isBanned: nextStatus } : b))
      );
    }
  };

  const handleKickBuilder = async (builder: Builder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (
      confirm(
        `[경고] '${builder.name}' (@${builder.handle}) 사용자를 강제 추방(영구 삭제)하시겠습니까?\n이 작업은 취소할 수 없습니다.`
      )
    ) {
      await deleteBuilder(builder.id);
      setBuilders((prev) => prev.filter((b) => b.id !== builder.id));
    }
  };

  const loadAllBuilders = async () => {
    const shared = await fetchSharedBuilders(user?.id);

    const map = new Map<string, Builder>();
    shared.forEach((b) => map.set(b.id, b));

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
    merged.sort((a, b) => {
      const diff = (b.followersCount || 0) - (a.followersCount || 0);
      if (diff !== 0) return diff;
      return (a.name || "").localeCompare(b.name || "");
    });

    setBuilders(merged);
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
    if (user.id === builderId) {
      return;
    }
    const result = toggleFollowBuilder(builderId, user.id);
    setBuilders((prev) =>
      prev
        .map((b) =>
          b.id === builderId
            ? {
                ...b,
                isFollowing: result.isFollowing,
                followersCount: result.followersCount,
              }
            : b
        )
        .sort((a, b) => {
          const diff = (b.followersCount || 0) - (a.followersCount || 0);
          if (diff !== 0) return diff;
          return (a.name || "").localeCompare(b.name || "");
        })
    );
  };

  const dynamicRoles = ["All", ...Array.from(new Set(builders.map((b) => b.role).filter(Boolean)))];

  const filtered = builders
    .filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchHandle = b.handle.toLowerCase().includes(q);
        const matchBio = b.bio.toLowerCase().includes(q);
        const matchRole = b.role.toLowerCase().includes(q);
        if (!matchName && !matchHandle && !matchBio && !matchRole) return false;
      }
      if (selectedRole !== "All" && b.role !== selectedRole) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const diff = (b.followersCount || 0) - (a.followersCount || 0);
      if (diff !== 0) return diff;
      return (a.name || "").localeCompare(b.name || "");
    });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          빌더 (Builders)
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          실제 사이드 프로젝트를 만들고 있는 zemix 메이커들을 만나고 협업해보세요.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="이름, 핸들, 역할, 소개글로 빌더 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-[12px] border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
      </div>

      {/* Role Pills & Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {dynamicRoles.map((role) => {
            const isActive = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface text-muted border border-border hover:text-foreground hover:bg-surface-muted hover:border-border-strong"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* Feature 34: Open to Work Filter */}
        <button
          type="button"
          onClick={() => setOpenToWorkOnly(!openToWorkOnly)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            openToWorkOnly
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-surface border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>💼 이직 / 스카우트 환영 (Open to Work)</span>
        </button>
      </div>

      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between text-xs text-muted">
        <span>
          총 <span className="font-semibold text-foreground">{filtered.length}</span>명의 빌더
        </span>
        {(searchQuery || selectedRole !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedRole("All");
            }}
            className="text-primary hover:underline cursor-pointer"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Builders Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((builder) => (
            <div
              key={builder.id}
              onClick={() => router.push(`/builders/${builder.id}`)}
              className="flex flex-col justify-between rounded-[16px] border border-border bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover cursor-pointer"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={builder.avatar}
                    alt={builder.name}
                    className="h-14 w-14 rounded-full border border-border object-cover bg-surface-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground truncate hover:text-primary transition-colors">
                        {builder.name}
                      </h3>
                      {builder.isBanned && (
                        <span className="shrink-0 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger border border-danger/30">
                          🚫 정지됨
                        </span>
                      )}
                      {isUserAdmin(builder) && (
                        <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          👑 관리자
                        </span>
                      )}
                      {builder.isStartingMember && !isUserAdmin(builder) && (
                        <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent border border-accent/20">
                          스타팅 멤버
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">@{builder.handle}</p>
                    <span className="mt-1 inline-block rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted border border-border/80">
                      {builder.role || "Maker"}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted leading-relaxed line-clamp-3">
                  {builder.bio || "등록된 소개글이 없습니다."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between text-xs text-muted mb-4">
                  <span className="flex items-center gap-1" title="등록한 프로젝트 수">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{builder.projectsCount || 0} 프로젝트</span>
                  </span>
                  <span className="flex items-center gap-1" title="팔로워">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{builder.followersCount || 0} 팔로워</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {user && user.id === builder.id ? (
                    <Link
                      href="/profile"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded-control py-2 text-xs font-semibold text-center transition-colors border border-border bg-surface-muted text-muted hover:text-foreground"
                    >
                      내 프로필 설정
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(builder.id);
                      }}
                      className={`flex-1 rounded-control py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        builder.isFollowing
                          ? "bg-surface-muted text-muted hover:text-foreground border border-border"
                          : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm"
                      }`}
                    >
                      {builder.isFollowing ? "팔로잉 중" : "+ 팔로우"}
                    </button>
                  )}

                  {builder.socials?.github && (
                    <a
                      href={builder.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-muted hover:text-foreground hover:bg-surface-muted"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}

                  {/* Feature 34: Direct Scout Offer */}
                  {(!user || user.id !== builder.id) && (
                    <button
                      type="button"
                      title="이직 / 사이드 프로젝트 스카우트 제안 보내기"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScoutTarget(builder);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-muted hover:text-primary hover:border-primary/50 hover:bg-primary-soft transition-colors cursor-pointer"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {isAdmin && builder.id !== user?.id && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/60" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleBan(builder, e)}
                      className={`flex-1 rounded-lg py-1 px-2 text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                        builder.isBanned
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30"
                      }`}
                    >
                      <UserX className="h-3 w-3" />
                      <span>{builder.isBanned ? "밴 해제" : "계정 밴"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleKickBuilder(builder, e)}
                      className="rounded-lg py-1 px-2.5 text-[11px] font-semibold text-danger bg-danger-soft hover:bg-danger/20 border border-danger/30 transition-colors cursor-pointer flex items-center gap-1"
                      title="사용자 강제 추방 (영구 삭제)"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>강제 추방</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : builders.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-card border border-dashed border-border bg-surface-muted/20 px-6">
          <p className="text-sm font-semibold text-foreground">
            검색 결과와 일치하는 빌더가 없습니다
          </p>
          <p className="mt-1 text-xs text-muted">
            다른 검색어를 입력하거나 역할 필터를 변경해보세요.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedRole("All");
            }}
            className="mt-4 rounded-control border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-surface-muted transition-colors cursor-pointer"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-card border border-dashed border-border bg-surface-muted/20 px-6">
          <p className="text-sm font-semibold text-foreground">
            아직 등록된 빌더가 없습니다
          </p>
          <p className="mt-1 text-xs text-muted">
            프로젝트를 등록한 첫 번째 메이커가 되어보세요!
          </p>
        </div>
      )}

      {/* Feature 34: Direct Scout Offer Modal */}
      {scoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>'{scoutTarget.name}' 님께 스카우트 제안 보내기</span>
            </h3>
            <p className="mt-1 text-xs text-muted">
              실제 프로덕트를 완성해 본 검증된 빌더에게 이직, 외주, 또는 공동 창업을 제안하세요.
            </p>

            {scoutSent ? (
              <div className="my-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <p className="text-sm font-bold text-emerald-500">스카우트 제안이 전송되었습니다!</p>
                <p className="text-xs text-muted mt-1">상대방의 이메일 및 알림함으로 안전하게 전달되었습니다.</p>
                <button
                  type="button"
                  onClick={() => {
                    setScoutTarget(null);
                    setScoutSent(false);
                  }}
                  className="mt-4 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  확인
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setScoutSent(true);
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">제안 포지션 / 형태</label>
                  <select className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary">
                    <option>정규직 개발자 / 디자이너 이직 제안</option>
                    <option>사이드 프로젝트 공동 창업 (지분 셰어)</option>
                    <option>외주 / 프리랜서 프로젝트 의뢰</option>
                    <option>가벼운 티타임 (커피챗)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">제안 회사 / 프로젝트명</label>
                  <input
                    required
                    placeholder="예: (주)알파테크, 신규 AI 스타트업"
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">메시지 내용</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="zemix에 올리신 프로젝트를 감명 깊게 보고 연락드립니다..."
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">답변받으실 연락처 (이메일/오픈카톡)</label>
                  <input
                    required
                    placeholder="founder@company.com 또는 open.kakao.com/..."
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setScoutTarget(null)}
                    className="rounded-control border border-border px-3.5 py-2 text-xs font-medium text-muted hover:text-foreground"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
                  >
                    제안 발송
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
