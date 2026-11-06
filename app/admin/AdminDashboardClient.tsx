"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Layers,
  MessageSquare,
  Search,
  Trash2,
  UserX,
  ExternalLink,
  Edit3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Builder, Project, CommunityPost } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import {
  fetchSharedProjects,
  fetchSharedBuilders,
  fetchSharedCommunityPosts,
  deleteProject,
  banUser,
  unbanUser,
  deleteBuilder,
} from "@/lib/storage";

export default function AdminDashboardClient() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"users" | "projects" | "community">("users");
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [directBanInput, setDirectBanInput] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bList, pList, cList] = await Promise.all([
        fetchSharedBuilders(),
        fetchSharedProjects(),
        fetchSharedCommunityPosts(),
      ]);
      setBuilders(bList);
      setProjects(pList);
      setPosts(cList);
    } catch (e) {
      console.warn("Admin data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadData();
    }
  }, [authLoading, isAdmin]);

  const showNotice = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // User Ban / Unban
  const handleToggleBan = (b: Builder) => {
    const nextStatus = !b.isBanned;
    const actionText = nextStatus ? "밴(활동 정지)" : "밴 해제";
    if (confirm(`'${b.name}' (@${b.handle}) 사용자를 ${actionText} 처리하시겠습니까?`)) {
      if (nextStatus) {
        banUser(b.id);
      } else {
        unbanUser(b.id);
      }
      setBuilders((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, isBanned: nextStatus } : item))
      );
      showNotice(`'${b.name}' 사용자가 ${actionText} 되었습니다.`);
    }
  };

  // User Kick (Delete)
  const handleKickUser = async (b: Builder) => {
    if (
      confirm(
        `[경고] '${b.name}' (@${b.handle}) 사용자를 강제 추방(영구 삭제)하시겠습니까?\n프로필 데이터가 완전히 삭제됩니다.`
      )
    ) {
      await deleteBuilder(b.id);
      setBuilders((prev) => prev.filter((item) => item.id !== b.id));
      showNotice(`'${b.name}' 사용자가 강제 추방되었습니다.`);
    }
  };

  // Direct Ban by ID or Handle
  const handleDirectBan = (e: React.FormEvent) => {
    e.preventDefault();
    const target = directBanInput.trim();
    if (!target) return;
    banUser(target);
    setDirectBanInput("");
    setBuilders((prev) =>
      prev.map((b) => (b.id === target || b.handle === target ? { ...b, isBanned: true } : b))
    );
    showNotice(`'${target}' 식별자가 밴 목록에 등록되었습니다.`);
  };

  // Project Force Delete
  const handleDeleteProject = async (p: Project) => {
    if (
      confirm(
        `[경고] '${p.title}' 프로젝트를 관리자 권한으로 즉시 삭제하시겠습니까?\n모든 피드백, 댓글 데이터가 함께 삭제됩니다.`
      )
    ) {
      deleteProject(p.id);
      setProjects((prev) => prev.filter((item) => item.id !== p.id));
      showNotice(`'${p.title}' 프로젝트가 삭제되었습니다.`);
    }
  };

  // Community Post Delete
  const handleDeletePost = async (post: CommunityPost) => {
    if (confirm(`'${post.title}' 게시글을 삭제하시겠습니까?`)) {
      try {
        await fetch(`/api/community?id=${encodeURIComponent(post.id)}`, { method: "DELETE" });
      } catch {}
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      showNotice(`게시글이 삭제되었습니다.`);
    }
  };

  // Non-admin Access Denied View
  if (!authLoading && !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-6 py-28 text-center animate-fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger mb-4">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground">관리자 전용 페이지</h1>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          이 페이지는 최고 관리자(1123janghyun1@gmail.com) 전용 제어 센터입니다.
          현재 계정은 관리자 권한이 없습니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const bannedCount = builders.filter((b) => b.isBanned).length;

  const filteredBuilders = builders.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.handle.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      (b.email && b.email.toLowerCase().includes(q))
    );
  });

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      (p.tagline && p.tagline.toLowerCase().includes(q)) ||
      (p.author?.name && p.author.name.toLowerCase().includes(q)) ||
      (p.author?.handle && p.author.handle.toLowerCase().includes(q))
    );
  });

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24">
      {/* Toast Notice */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-card border border-border bg-surface px-4 py-3 shadow-popover flex items-center gap-2 text-xs font-semibold text-foreground animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>zemix Super Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            관리자 통합 제어 센터
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            로그인 관리자: <span className="font-semibold text-foreground">{user?.email || "1123janghyun1@gmail.com"}</span> (모든 권한 활성화됨)
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="rounded-card border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">전체 빌더 (회원)</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{builders.length}</p>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">등록된 프로젝트</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{projects.length}</p>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">활동 정지 (밴) 회원</span>
            <UserX className="h-4 w-4 text-danger" />
          </div>
          <p className="text-2xl font-bold text-danger">{bannedCount}</p>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">커뮤니티 게시글</span>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{posts.length}</p>
        </div>
      </div>

      {/* Direct Ban Quick Bar */}
      <form
        onSubmit={handleDirectBan}
        className="mt-6 flex flex-col sm:flex-row items-center gap-3 rounded-card border border-amber-500/30 bg-amber-500/5 p-4"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
          <ShieldAlert className="h-4 w-4" />
          <span>신속 밴(활동 정지) 등록:</span>
        </div>
        <input
          type="text"
          value={directBanInput}
          onChange={(e) => setDirectBanInput(e.target.value)}
          placeholder="사용자 ID, 핸들(@ 제외), 또는 이메일 입력..."
          className="flex-1 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full sm:w-auto rounded-lg bg-amber-500 text-white font-semibold px-4 py-1.5 text-xs hover:bg-amber-600 transition-colors shrink-0 cursor-pointer"
        >
          즉시 밴 처리
        </button>
      </form>

      {/* Tabs and Search */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="inline-flex rounded-xl bg-surface-muted p-1 border border-border">
          <button
            onClick={() => {
              setActiveTab("users");
              setSearchQuery("");
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            👥 사용자 관리 ({builders.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("projects");
              setSearchQuery("");
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            🚀 프로젝트 관리 ({projects.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("community");
              setSearchQuery("");
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "community"
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            💬 커뮤니티 관리 ({posts.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어 입력..."
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Tab 1: Users Table */}
      {activeTab === "users" && (
        <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-muted/60 text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">메이커 (사용자)</th>
                <th className="px-4 py-3">핸들 / ID</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">프로젝트 수</th>
                <th className="px-4 py-3">계정 상태</th>
                <th className="px-4 py-3 text-right">관리자 권한 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBuilders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted">
                    검색 조건에 일치하는 사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredBuilders.map((b) => {
                  const isCurrentAdmin = b.id === user?.id || b.email === "1123janghyun1@gmail.com";
                  return (
                    <tr key={b.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={b.avatar}
                            alt={b.name}
                            className="h-8 w-8 rounded-full border border-border object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              <span>{b.name}</span>
                              {isCurrentAdmin && (
                                <span className="rounded bg-amber-500/15 px-1 text-[9px] font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted">{b.bio?.slice(0, 30) || "소개 없음"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <div>@{b.handle}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{b.id.slice(0, 12)}...</div>
                      </td>
                      <td className="px-4 py-3 text-muted">{b.role || "Maker"}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{b.projectsCount || 0}</td>
                      <td className="px-4 py-3">
                        {b.isBanned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger border border-danger/30">
                            🚫 정지됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            정상 활동
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/builders/${b.id}`}
                            className="rounded-lg border border-border p-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                            title="프로필 보기"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          {!isCurrentAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleBan(b)}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                  b.isBanned
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30"
                                }`}
                                title={b.isBanned ? "밴 해제" : "계정 정지(밴)"}
                              >
                                {b.isBanned ? "해제" : "밴"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleKickUser(b)}
                                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-danger bg-danger-soft hover:bg-danger/20 border border-danger/30 transition-colors cursor-pointer"
                                title="사용자 강제 추방 (영구 삭제)"
                              >
                                강제 추방
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Projects Table */}
      {activeTab === "projects" && (
        <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-muted/60 text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">프로젝트</th>
                <th className="px-4 py-3">메이커</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">통계</th>
                <th className="px-4 py-3 text-right">관리자 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted">
                    등록된 프로젝트가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.logo || p.coverImage || "/icon.svg"}
                          alt={p.title}
                          className="h-9 w-9 rounded-xl border border-border object-cover"
                        />
                        <div>
                          <p className="font-bold text-foreground text-sm">{p.title}</p>
                          <p className="text-[11px] text-muted line-clamp-1">{p.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <span className="font-medium text-foreground">{p.author?.name || "알 수 없음"}</span>
                      <span className="text-[10px] text-muted block">@{p.author?.handle}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted border border-border">
                        {p.status || "Public"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <span className="font-semibold text-rose-500">❤️ {p.likesCount || 0}</span>
                      <span className="mx-2 text-border-strong">/</span>
                      <span>👀 {p.viewsCount || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/projects/${p.id}`}
                          className="rounded-lg border border-border p-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                          title="프로젝트 상세 보기"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/projects/${p.id}/edit`}
                          className="rounded-lg border border-border p-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                          title="프로젝트 수정 (Admin)"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(p)}
                          className="rounded-lg border border-danger/30 bg-danger-soft p-1.5 text-danger hover:bg-danger/20 transition-colors cursor-pointer"
                          title="프로젝트 강제 삭제 (Admin)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Community Table */}
      {activeTab === "community" && (
        <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-muted/60 text-muted uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">게시글 제목 & 요약</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">반응</th>
                <th className="px-4 py-3 text-right">관리자 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted">
                    등록된 커뮤니티 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-4 py-3 max-w-md">
                      <p className="font-bold text-foreground">{post.title}</p>
                      <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{post.content}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted border border-border">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <span className="font-medium text-foreground">{post.author.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <span>❤️ {post.likesCount || 0}</span>
                      <span className="mx-2 text-border-strong">/</span>
                      <span>💬 {post.commentsCount || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href="/community"
                          className="rounded-lg border border-border p-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                          title="커뮤니티 이동"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post)}
                          className="rounded-lg border border-danger/30 bg-danger-soft p-1.5 text-danger hover:bg-danger/20 transition-colors cursor-pointer"
                          title="게시글 즉시 삭제 (Admin)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
