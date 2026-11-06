"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Calendar, Users, Award, CheckCircle2, Flame, ArrowRight, Plus } from "lucide-react";
import { getChallenges, toggleJoinChallenge } from "@/lib/storage";
import { ChallengeItem } from "@/lib/types";

export default function ChallengesClient() {
  const [challenges, setChallenges] = useState<ChallengeItem[]>(getChallenges());

  const handleToggle = (id: string) => {
    const updated = toggleJoinChallenge(id);
    setChallenges(updated);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="border-b border-border bg-surface-muted/30 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold mb-4">
            <Flame className="h-3.5 w-3.5" />
            <span>빌더 스프린트 & 퀘스트</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            월간 빌더 챌린지 (Sprint & Badges)
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted max-w-2xl mx-auto">
            혼자 개발하면 지치고 늘어지기 쉽습니다. zemix 빌더들과 함께 동일한 기한을 잡고 챌린지에 도전하여 한정판 디지털 배지와 런칭 하이라이트 혜택을 획득하세요.
          </p>
        </div>
      </section>

      {/* Challenge Cards */}
      <main className="mx-auto max-w-4xl px-6 pt-10 space-y-6">
        {challenges.map((c) => (
          <div
            key={c.id}
            className="rounded-card border border-border bg-surface p-6 shadow-card hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {c.hashtag}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted">
                  <Calendar className="h-3 w-3" />
                  마감: {c.deadline}
                </span>
              </div>

              <h3 className="text-lg md:text-xl font-bold text-foreground">{c.title}</h3>
              <p className="text-xs md:text-sm text-muted leading-relaxed">{c.description}</p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold bg-surface-muted px-3 py-1 rounded-control border border-border">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  <span>보상 배지: {c.rewardBadge}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Users className="h-3.5 w-3.5" />
                  <span>참여자 {c.participantsCount}명</span>
                  <span>•</span>
                  <span>제출 완료 {c.submissionsCount}개</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 md:min-w-[140px]">
              <button
                onClick={() => handleToggle(c.id)}
                className={`w-full rounded-control py-2.5 px-4 text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  c.isJoined
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-primary text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                {c.isJoined ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>참가 신청됨</span>
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    <span>챌린지 참가</span>
                  </>
                )}
              </button>

              <Link
                href="/projects/new"
                className="w-full text-center rounded-control border border-border bg-surface hover:bg-surface-muted py-2 text-xs font-semibold text-muted hover:text-foreground transition-colors"
              >
                프로젝트 제출하기
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
