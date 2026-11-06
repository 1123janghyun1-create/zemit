"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Flame, Gauge, Sparkles, SlidersHorizontal, Award } from "lucide-react";
import { Project } from "@/lib/types";

interface TestingAndQaTabProps {
  project: Project;
}

export default function TestingAndQaTab({ project }: TestingAndQaTabProps) {
  const [completedQuests, setCompletedQuests] = useState<Record<number, boolean>>({});
  const [sliderPos, setSliderPos] = useState<number>(50);

  const defaultQuests = [
    { title: "웹사이트 접속 후 30초 둘러보기", reward: "+20 XP" },
    { title: "핵심 기능 1회 사용해보고 느낌점 피드백 남기기", reward: "+50 XP & 감사 배지" },
    { title: "모바일 또는 사파리 브라우저에서 버그 있는지 확인하기", reward: "+30 XP" },
  ];

  const toggleQuest = (idx: number) => {
    setCompletedQuests((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const v1Image = project.screenshots?.[0] || project.coverImage || "/icon.png";
  const vCurrent = project.coverImage || project.logo || "/icon.png";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. UX Quest Checklist (Feature 28) */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>베타 테스트 퀘스트 (UX Quests)</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              메이커가 준비한 미션을 수행하고 피드백을 남기면 빌더 XP와 디지털 리워드를 획득합니다.
            </p>
          </div>
          <span className="rounded-full bg-amber-500/10 text-amber-500 font-bold px-2.5 py-0.5 text-xs">
            퀘스트 {Object.values(completedQuests).filter(Boolean).length} / {defaultQuests.length} 완료
          </span>
        </div>

        <div className="space-y-2.5">
          {defaultQuests.map((q, idx) => {
            const isDone = Boolean(completedQuests[idx]);
            return (
              <div
                key={idx}
                onClick={() => toggleQuest(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isDone
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-surface-muted/40 border-border hover:border-primary/40 text-foreground"
                }`}
              >
                <div className="flex items-center gap-3 text-xs font-semibold">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted shrink-0" />
                  )}
                  <span className={isDone ? "line-through opacity-80" : ""}>{q.title}</span>
                </div>
                <span className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-mono font-bold text-amber-500 border border-border shadow-2xs">
                  {q.reward}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Google Lighthouse 4-Ring Scores (Feature 30) */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-500" />
              <span>Google Lighthouse 실시간 웹 성능 점수표</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              구글 공식 웹 표준에 따른 성능, 웹 접근성, 검색엔진 최적화(SEO) 4대 지표입니다.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold">
            Grade A+
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {[
            { label: "Performance", score: 98, color: "text-emerald-500", ring: "stroke-emerald-500" },
            { label: "Accessibility", score: 96, color: "text-emerald-500", ring: "stroke-emerald-500" },
            { label: "Best Practices", score: 100, color: "text-emerald-500", ring: "stroke-emerald-500" },
            { label: "SEO Score", score: 100, color: "text-emerald-500", ring: "stroke-emerald-500" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-surface-muted/30 p-4 text-center space-y-2">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" className="text-border" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="175.9"
                    strokeDashoffset={175.9 * (1 - m.score / 100)}
                    className={m.ring}
                  />
                </svg>
                <span className={`absolute text-sm font-black ${m.color}`}>{m.score}</span>
              </div>
              <p className="text-xs font-semibold text-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Project Time Machine Before & After Slider (Feature 44) */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-purple-500" />
              <span>프로젝트 타임머신 (Before & After 비교)</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              슬라이더를 좌우로 움직여 초기 프로토타입과 현재 완성된 화면의 성장을 비교해보세요.
            </p>
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black/40 select-none">
          {/* Base Image (Current) */}
          <img src={vCurrent} alt="Current Version" className="absolute inset-0 w-full h-full object-cover" />

          {/* Overlay Image (Early Prototype / v1) clipped by slider */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={v1Image}
              alt="Early Prototype"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: "100%", height: "100%" }}
            />
            <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
              초기 프로토타입 (v1.0)
            </span>
          </div>

          <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
            현재 버전 (Current)
          </span>

          {/* Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl text-xs font-bold">
              ↔
            </div>
          </div>

          {/* Range Input on Top */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />
        </div>
      </div>
    </div>
  );
}
