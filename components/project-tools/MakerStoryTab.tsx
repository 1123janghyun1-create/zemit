"use client";

import React from "react";
import { BookOpen, Sparkles, Heart, Quote, ArrowRight } from "lucide-react";
import { Project } from "@/lib/types";

interface MakerStoryTabProps {
  project: Project;
}

export default function MakerStoryTab({ project }: MakerStoryTabProps) {
  const story =
    project.makerStory ||
    `### 💡 우리가 이 문제를 풀기로 결심한 이유

처음 아이디어가 떠오른 건 작년 여름이었습니다. 항상 똑같은 개발 작업을 반복하며 "이런 도구가 있으면 나와 내 동료들의 시간을 수십 시간씩 아낄 수 있을 텐데"라는 깊은 갈증에서 시작되었습니다.

퇴근 후 밤마다 2시간씩, 그리고 주말의 모든 시간을 쏟아부으며 수많은 버그와 마주쳤습니다. 때로는 "과연 아무도 안 쓰면 어쩌지?"라는 번아웃과 두려움도 찾아왔지만, zemix의 다른 빌더들의 열정을 보며 다시 키보드를 잡았습니다.

### 🛠️ 개발 과정에서 겪은 가장 큰 실패와 배움
초기 v0.1 버전은 기능이 너무 많아서 오히려 복잡했습니다. 10명의 첫 테스터 인터뷰를 거치며 핵심 기능 1가지만 남기고 과감히 덜어내는 과정을 거쳤고, 그 결과 지금의 직관적인 사용자 경험을 완성할 수 있었습니다.

### 🚀 앞으로의 로드맵
우리는 여기서 멈추지 않습니다. zemix 커뮤니티에서 주신 소중한 피드백을 바탕으로, 다음 달에는 실시간 협업 기능과 AI 자동 분석 기능을 추가할 예정입니다. 함께 호흡해 주셔서 감사합니다!`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-card border border-border bg-surface p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-foreground">
              메이킹 다큐 & 비하인드 스토리
            </h3>
            <p className="text-xs text-muted">
              빌더가 직접 쓴 진솔한 개발 계기, 번아웃 극복기, 그리고 프로덕트의 철학
            </p>
          </div>
        </div>

        {/* Story Body */}
        <div className="prose dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed text-muted space-y-4 whitespace-pre-line">
          {story}
        </div>

        {/* Maker Sign-off */}
        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={project.author?.avatar || "/icon.png"}
              alt={project.author?.name}
              className="h-9 w-9 rounded-full border border-border object-cover"
            />
            <div>
              <p className="text-xs font-bold text-foreground">{project.author?.name} 메이커 드림</p>
              <p className="text-[11px] text-muted">@{project.author?.handle}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 fill-current text-rose-500" />
            <span>Built with passion on zemix</span>
          </span>
        </div>
      </div>
    </div>
  );
}
