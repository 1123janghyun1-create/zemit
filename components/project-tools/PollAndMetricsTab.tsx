"use client";

import React, { useState } from "react";
import { BarChart3, CheckCircle2, Sparkles, TrendingUp, Users, DollarSign, Bot } from "lucide-react";
import { Project } from "@/lib/types";

interface PollAndMetricsTabProps {
  project: Project;
}

interface PollOption {
  text: string;
  votes: number;
}

export default function PollAndMetricsTab({ project }: PollAndMetricsTabProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { text: "🌙 다크모드 및 모바일 UI 최적화", votes: 42 },
    { text: "⚡ 소셜 로그인 및 데이터 백업", votes: 29 },
    { text: "📊 통계 대시보드 및 리포트 내보내기", votes: 35 },
    { text: "🤝 실시간 협업 및 팀원 공유 기능", votes: 18 },
  ]);

  const totalVotes = pollOptions.reduce((acc, curr) => acc + curr.votes, 0);

  const handleVote = (idx: number) => {
    if (hasVoted) return;
    setSelectedOption(idx);
    setHasVoted(true);
    setPollOptions((prev) =>
      prev.map((opt, i) => (i === idx ? { ...opt, votes: opt.votes + 1 } : opt))
    );
  };

  return (
    <div className="space-y-8">
      {/* Interactive Poll Widget */}
      <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h4 className="text-sm md:text-base font-bold text-foreground">
              빌더의 질문: 다음 업데이트로 가장 기대되는 기능은?
            </h4>
          </div>
          <span className="text-xs text-muted font-medium">총 {totalVotes}명 참여</span>
        </div>
        <p className="text-xs text-muted mb-4">
          여러분의 투표 하나가 빌더의 다음 개발 로드맵에 직접 반영됩니다.
        </p>

        <div className="space-y-2.5">
          {pollOptions.map((opt, idx) => {
            const percent = Math.round((opt.votes / (totalVotes || 1)) * 100);
            const isSelected = selectedOption === idx;

            return (
              <button
                key={idx}
                onClick={() => handleVote(idx)}
                disabled={hasVoted}
                className={`relative w-full rounded-xl border p-3 text-left transition-all overflow-hidden cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary-soft/30 shadow-sm"
                    : "border-border hover:border-border-strong bg-surface"
                }`}
              >
                {/* Background Progress Bar */}
                {hasVoted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-primary-soft/40 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {opt.text}
                  </span>
                  {hasVoted && (
                    <span className="font-mono font-bold text-muted ml-2 shrink-0">
                      {percent}% ({opt.votes}표)
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Open Metrics (Build in Public Dashboard) */}
      <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm md:text-base font-bold text-foreground">
              오픈 메트릭스 (Build in Public 대시보드)
            </h4>
            <p className="text-[11px] text-muted">빌더가 투명하게 공개한 프로젝트 성장 지표</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5 text-center">
            <span className="text-[11px] text-muted font-medium">누적 방문자</span>
            <div className="text-lg font-black text-foreground mt-1">2,480명</div>
            <span className="text-[10px] text-emerald-500 font-semibold">+18% 이번 주</span>
          </div>
          <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5 text-center">
            <span className="text-[11px] text-muted font-medium">활성 사용자(MAU)</span>
            <div className="text-lg font-black text-foreground mt-1">540명</div>
            <span className="text-[10px] text-emerald-500 font-semibold">+12% 전월 대비</span>
          </div>
          <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5 text-center">
            <span className="text-[11px] text-muted font-medium">zemix 하트(응원)</span>
            <div className="text-lg font-black text-rose-500 mt-1">{project.likesCount || 0}개</div>
            <span className="text-[10px] text-muted font-semibold">인기 프로젝트</span>
          </div>
          <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5 text-center">
            <span className="text-[11px] text-muted font-medium">월 수익(MRR)</span>
            <div className="text-lg font-black text-foreground mt-1">$150</div>
            <span className="text-[10px] text-primary font-semibold">첫 수익 달성 🎉</span>
          </div>
        </div>
      </div>

      {/* 4. AI Consultant Review Report */}
      <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <Bot className="h-4 w-4" />
          </span>
          <h4 className="text-sm md:text-base font-bold text-foreground">
            AI 프로젝트 자동 리뷰어 리포트
          </h4>
        </div>

        <div className="space-y-3 text-xs leading-relaxed">
          <div className="rounded-xl bg-surface-muted p-3 border border-border/50">
            <strong className="text-foreground block mb-1 text-emerald-500">🌟 핵심 강점 3가지</strong>
            <p className="text-muted">
              1) 명확한 타겟 고객과 직관적인 한 줄 소개.<br />
              2) 가벼운 웹 기반으로 별도 설치 없이 즉시 실행 가능.<br />
              3) 모던 기술 스택({(project.tags || []).join(", ") || "Next.js, Supabase"}) 기반의 빠른 속도.
            </p>
          </div>

          <div className="rounded-xl bg-surface-muted p-3 border border-border/50">
            <strong className="text-foreground block mb-1 text-amber-500">💡 랜딩페이지 개선 제안 2가지</strong>
            <p className="text-muted">
              1) 첫 화면 히어로 섹션에 10초 시연 GIF나 영상을 추가하면 전환율이 2배 이상 상승합니다.<br />
              2) 실제 사용자의 후기나 스크린샷 비교를 넣어 신뢰도를 높이세요.
            </p>
          </div>

          <div className="rounded-xl bg-surface-muted p-3 border border-border/50">
            <strong className="text-foreground block mb-1 text-sky-500">🎯 추천 타겟 고객군</strong>
            <p className="text-muted">
              - 1인 개발자, 학생, 스타트업 기획자, 기술 얼리어답터
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
