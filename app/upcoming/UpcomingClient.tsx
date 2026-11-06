"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Rocket,
  Bell,
  Check,
  Calendar,
  Users,
  Plus,
  X,
  Sparkles,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface UpcomingItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  logo?: string;
  targetDate: string; // YYYY-MM-DD
  daysLeft: number;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  tags: string[];
  subscribers: number;
  createdAt?: string;
}

const STORAGE_KEY = "zemix_upcoming_projects_v1";

function calculateDaysLeft(targetDateStr: string): number {
  try {
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 7;
  }
}

export default function UpcomingClient() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<UpcomingItem[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleDeleteItem = (id: string) => {
    if (!confirm("이 런칭 프로젝트를 삭제하시겠습니까?")) return;
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Form State
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [tags, setTags] = useState("");
  const [authorName, setAuthorName] = useState("");

  // Load from local storage (initial state is 100% clean / no fake projects)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Recalculate daysLeft dynamically
          const recalculated = parsed.map((item: UpcomingItem) => ({
            ...item,
            daysLeft: calculateDaysLeft(item.targetDate),
          }));
          setItems(recalculated);
        }
      }
    } catch {}

    try {
      const savedSubs = localStorage.getItem("zemix_subscribed_upcoming_ids");
      if (savedSubs) {
        setSubscribedIds(JSON.parse(savedSubs));
      }
    } catch {}
  }, []);

  const toggleSubscribe = (id: string) => {
    setSubscribedIds((prev) => {
      const isSub = !prev[id];
      const nextSubs = { ...prev, [id]: isSub };
      try {
        localStorage.setItem("zemix_subscribed_upcoming_ids", JSON.stringify(nextSubs));
      } catch {}

      setItems((list) => {
        const updated = list.map((it) =>
          it.id === id
            ? { ...it, subscribers: Math.max(0, it.subscribers + (isSub ? 1 : -1)) }
            : it
        );
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      return nextSubs;
    });
  };

  const handleCreateUpcoming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim() || !targetDate) {
      alert("프로젝트 이름, 한 줄 소개, 런칭 예정일을 입력해 주세요.");
      return;
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem: UpcomingItem = {
      id: `upcoming-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim() || tagline.trim(),
      targetDate,
      daysLeft: calculateDaysLeft(targetDate),
      authorName: authorName.trim() || "메이커",
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        authorName.trim() || "maker"
      )}`,
      tags: tagList.length > 0 ? tagList : ["SideProject", "Product"],
      subscribers: 1,
      createdAt: new Date().toISOString(),
    };

    const nextList = [newItem, ...items];
    setItems(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch {}

    // Reset Form
    setTitle("");
    setTagline("");
    setDescription("");
    setTargetDate("");
    setTags("");
    setAuthorName("");
    setShowAddModal(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
            <Rocket className="h-3.5 w-3.5" />
            <span>Coming Soon • 사전 등록</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
            사이드 프로젝트 런칭 D-Day
          </h1>
          <p className="text-xs md:text-sm text-muted mt-2 max-w-2xl leading-relaxed">
            배포를 앞두고 열심히 개발 중인 사이드 프로젝트들입니다. 미리 <b>'알림 받기'</b>를 등록하고 가장 먼저 얼리어답터 혜택을 누려보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>내 프로젝트 D-Day 등록</span>
        </button>
      </div>

      {/* Upcoming List or Empty State */}
      {mounted && items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-surface/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4 border border-primary/20">
            <Rocket className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            현재 등록된 런칭 D-Day 프로젝트가 없습니다
          </h3>
          <p className="text-xs md:text-sm text-muted mt-2 max-w-md leading-relaxed">
            배포 및 런칭을 앞두고 개발 중인 프로젝트가 있다면, D-Day를 등록하고 서비스 런칭 시 알림을 받을 초기 팬과 테스터를 미리 모아보세요!
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>첫 번째 프로젝트 D-Day 등록하기</span>
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => {
            const isSub = subscribedIds[item.id];
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-surface p-5 md:p-6 transition-all hover:border-border-strong hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-xl font-bold text-white shadow-sm">
                      {item.title.slice(0, 1).toUpperCase()}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-500 border border-rose-500/20">
                          {item.daysLeft === 0 ? "D-Day 오늘 오픈!" : `D-${item.daysLeft}`}
                        </span>
                        <h2 className="text-base md:text-lg font-bold text-foreground">
                          {item.title}
                        </h2>
                      </div>

                      <p className="text-xs md:text-sm font-medium text-foreground/90 mt-1">
                        {item.tagline}
                      </p>
                      {item.description && item.description !== item.tagline && (
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Tags & Author */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border/60 text-[11px] text-muted">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={
                              item.authorAvatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                item.authorName
                              )}`
                            }
                            alt={item.authorName}
                            className="h-4 w-4 rounded-full object-cover"
                          />
                          <span className="font-semibold text-foreground">{item.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{item.targetDate} 런칭 예정</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <Users className="h-3 w-3" />
                          <span>{item.subscribers}명 대기 중</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 flex items-center md:flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSubscribe(item.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer w-full md:w-36 ${
                        isSub
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm"
                      }`}
                    >
                      {isSub ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>알림 등록 완료</span>
                        </>
                      ) : (
                        <>
                          <Bell className="h-3.5 w-3.5" />
                          <span>출시 알림 받기</span>
                        </>
                      )}
                    </button>
                    {(isAdmin || (user && user.name === item.authorName)) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-xs text-muted hover:text-danger p-1 transition-colors flex items-center gap-1 cursor-pointer"
                        title="프로젝트 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>삭제</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Upcoming Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-muted hover:bg-surface-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 text-primary mb-2">
              <Rocket className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">런칭 카운트다운</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              내 프로젝트 런칭 D-Day 등록하기
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              출시 일정을 공지하고 오픈 당일 이메일/알림을 받아볼 얼리어답터들을 모아보세요.
            </p>

            <form onSubmit={handleCreateUpcoming} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  프로젝트 이름 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: SchoolEcho"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  한 줄 소개 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 학교 안에서 학생들의 소식을 실시간으로 나누는 커뮤니티"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    목표 런칭일 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    메이커 이름
                  </label>
                  <input
                    type="text"
                    placeholder="예: 장현"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  상세 설명 (준비 중인 핵심 기능 등)
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 현재 기본 피드 구현 완료 후 알림 기능 연동 중입니다. 11월 초 베타 오픈 예정입니다."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  기술 태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  placeholder="예: Next.js, AI, Supabase, Tailwind"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
                >
                  D-Day 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
