"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lightbulb, GitFork, Plus, Sparkles, X, Check, Code, User, AlertTriangle, Trash2 } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";

export interface Idea {
  id: string;
  title: string;
  summary: string;
  reason: string;
  suggestedStack: string[];
  author: string;
  authorAvatar?: string;
  githubUrl?: string;
  contactUrl?: string;
  forksCount: number;
  createdAt?: string;
}

const STORAGE_KEY = "zemix_donated_ideas_v1";

export default function IdeasClient() {
  const { user, isAdmin } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [forkedIds, setForkedIds] = useState<Record<string, boolean>>({});
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleDeleteIdea = (id: string) => {
    if (!confirm("이 아이디어를 삭제하시겠습니까?")) return;
    const updated = ideas.filter((i) => i.id !== id);
    setIdeas(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Form State
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [reason, setReason] = useState("");
  const [suggestedStack, setSuggestedStack] = useState("");
  const [author, setAuthor] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [contactUrl, setContactUrl] = useState("");

  // Load from local storage on mount (initial state is 100% clean / no fake projects)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setIdeas(parsed);
        }
      }
    } catch {}

    try {
      const savedForks = localStorage.getItem("zemix_forked_ideas_ids");
      if (savedForks) {
        setForkedIds(JSON.parse(savedForks));
      }
    } catch {}
  }, []);

  const handleFork = (id: string) => {
    setForkedIds((prev) => {
      const isFork = !prev[id];
      const nextForks = { ...prev, [id]: isFork };
      try {
        localStorage.setItem("zemix_forked_ideas_ids", JSON.stringify(nextForks));
      } catch {}

      setIdeas((list) => {
        const updated = list.map((it) =>
          it.id === id ? { ...it, forksCount: Math.max(0, it.forksCount + (isFork ? 1 : -1)) } : it
        );
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      return nextForks;
    });
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !reason.trim()) {
      alert("아이디어 제목, 설명, 중단 사유를 입력해 주세요.");
      return;
    }

    const stacks = suggestedStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      reason: reason.trim(),
      suggestedStack: stacks.length > 0 ? stacks : ["React", "TypeScript"],
      author: author.trim() || "익명 메이커",
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        author.trim() || "maker"
      )}`,
      githubUrl: githubUrl.trim() || undefined,
      contactUrl: contactUrl.trim() || undefined,
      forksCount: 0,
      createdAt: new Date().toISOString(),
    };

    const nextList = [newIdea, ...ideas];
    setIdeas(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch {}

    // Reset Form
    setTitle("");
    setSummary("");
    setReason("");
    setSuggestedStack("");
    setAuthor("");
    setGithubUrl("");
    setContactUrl("");
    setShowDonateModal(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold mb-3 border border-emerald-500/20">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Idea Graveyard & Revival • 아이디어 부활</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
            아이디어 묘지 & 부활 (Fork)
          </h1>
          <p className="text-xs md:text-sm text-muted mt-2 max-w-2xl leading-relaxed">
            "아이디어는 너무 좋은데 시간이 없어서 멈춘 프로젝트"들을 기부하고, 다른 빌더가 이어받아(Fork) 세상에 런칭할 수 있는 오픈 기부 공간입니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDonateModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>내 미완성 아이디어 기부</span>
        </button>
      </div>

      {/* Ideas List or Empty State */}
      {mounted && ideas.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-surface/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
            <Lightbulb className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            아직 등록된 기부 아이디어가 없습니다
          </h3>
          <p className="text-xs md:text-sm text-muted mt-2 max-w-md leading-relaxed">
            시간이나 여유가 부족해 개발을 멈췄거나 방치된 아이디어가 있다면, 다른 개발자가 이어받아 완성할 수 있도록 첫 번째 아이디어를 기부해보세요!
          </p>
          <button
            type="button"
            onClick={() => setShowDonateModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>첫 번째 아이디어 기부하기</span>
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map((idea) => {
            const isForked = forkedIds[idea.id];
            return (
              <div
                key={idea.id}
                className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between hover:border-border-strong hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground">{idea.title}</h3>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                      <GitFork className="h-3.5 w-3.5 text-primary" />
                      <span>{idea.forksCount}명 이어받음</span>
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-foreground/90 mt-2.5 leading-relaxed">
                    {idea.summary}
                  </p>

                  {/* Reason why stopped */}
                  <div className="mt-4 rounded-xl bg-surface-muted p-3 border border-border/60">
                    <span className="text-[11px] font-bold text-amber-500 block mb-0.5">
                      ⚠️ 중단 사유 및 상태
                    </span>
                    <p className="text-xs text-muted leading-relaxed">{idea.reason}</p>
                  </div>

                  {/* Suggested Stacks */}
                  {idea.suggestedStack && idea.suggestedStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {idea.suggestedStack.map((stk) => (
                        <span
                          key={stk}
                          className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary"
                        >
                          {stk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        idea.authorAvatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          idea.author
                        )}`
                      }
                      alt={idea.author}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-muted font-medium">원작자: {idea.author}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {idea.githubUrl && (
                      <a
                        href={idea.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-border p-2 text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                        title="깃허브 소스코드 보기"
                      >
                        <GithubIcon className="h-4 w-4" />
                      </a>
                    )}
                    {(isAdmin || (user && user.name === idea.author)) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="rounded-lg border border-border p-2 text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                        title="아이디어 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleFork(idea.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isForked
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm"
                      }`}
                    >
                      <GitFork className="h-3.5 w-3.5" />
                      <span>{isForked ? "이어받기 완료! 🚀" : "이어서 개발하기 (Fork)"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Donate Idea Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowDonateModal(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-muted hover:bg-surface-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 text-emerald-500 mb-2">
              <Lightbulb className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">미완성 아이디어 기부</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              멈춘 프로젝트를 세상에 공유해보세요
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              아이디어와 프로토타입을 오픈하면 다른 열정적인 빌더가 이어서 완성하고 협업을 제안할 수 있습니다.
            </p>

            <form onSubmit={handleCreateIdea} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  아이디어/프로젝트 이름 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 깃허브 커밋 톤앤매너 감정 분석 봇"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  핵심 기능 및 소개 <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="예: 개발팀의 커밋 메시지 감정을 분석해 번아웃 위험도를 대시보드로 시각화해 주는 슬랙 봇입니다."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  중단 사유 및 현재 상태 <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="예: 직장 이직으로 시간이 부족해 프론트엔드 프로토타입까지만 만들고 멈췄습니다. 슬랙 봇 연동하실 분 환영합니다!"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  추천 기술 스택 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  placeholder="예: Next.js, Slack Bolt, Supabase, Tailwind"
                  value={suggestedStack}
                  onChange={(e) => setSuggestedStack(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    작성자/메이커 이름
                  </label>
                  <input
                    type="text"
                    placeholder="예: 홍길동"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    GitHub 저장소 URL (선택)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setShowDonateModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
                >
                  아이디어 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
