"use client";

import React, { useState } from "react";
import { X, Copy, Check, Bot, FileText, Sparkles, Play } from "lucide-react";
import { Project } from "@/lib/types";

interface AiLaunchWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export default function AiLaunchWriterModal({ isOpen, onClose, project }: AiLaunchWriterModalProps) {
  const [activeTab, setActiveTab] = useState<"geeknews" | "velog" | "shorts">("geeknews");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://zemix.kr";
  const projectLink = `${siteUrl}/projects/${project.id}`;

  const geeknewsDraft = `Show GN: ${project.title} - ${project.tagline}

안녕하세요, 긱뉴스 사용자 여러분!
${project.description || "새로운 사이드 프로젝트를 런칭하여 공유드립니다."}

주요 기능:
- ${project.tagline}
- 사용 기술 스택: ${(project.tags || []).join(", ") || "Next.js, TypeScript"}
- 웹사이트: ${project.websiteUrl || projectLink}

동료 개발자분들의 솔직한 피드백과 조언을 부탁드립니다!
zemix 쇼케이스: ${projectLink}`;

  const velogDraft = `# ${project.title}: 사이드 프로젝트 직접 개발하고 런칭한 회고록

안녕하세요! 사이드 프로젝트로 **${project.title}**을 개발하고 배포한 회고를 작성합니다.

## 1. 기획 배경
> "${project.tagline}"

평소에 겪었던 문제를 해결하기 위해 주말과 퇴근 후 시간을 활용해 개발을 시작했습니다.

## 2. 사용한 기술 스택
- **Frontend / Backend**: ${(project.tags || []).join(", ") || "Next.js, TypeScript, Tailwind CSS, Supabase"}

## 3. 핵심 기능 & 해결한 과제
${project.description}

## 4. 런칭 후 피드백 및 앞으로의 계획
현재 zemix 쇼케이스에 프로젝트를 등록하고 초기 사용자들의 피드백을 수집하고 있습니다.
많은 응원과 피드백 부탁드립니다!

👉 ${project.title} 구경하러 가기: ${project.websiteUrl || projectLink}
👉 zemix 쇼케이스 링크: ${projectLink}`;

  const shortsDraft = `[30초 유튜브 쇼츠 / 릴스 대본]

(0~5초 / 훅)
"아직 세상에 잘 안 알려진 꿀 사이트 하나 소개해 드릴게요!"
화면: ${project.title} 메인 화면 녹화

(6~18초 / 설명)
"${project.title}은 ${project.tagline} 서비스인데요.
${project.description ? project.description.slice(0, 50) + "..." : "복잡한 과정 없이 누구나 무료로 사용해 볼 수 있습니다."}"

(19~30초 / 행동유도)
"지금 바로 프로필 링크나 고정 댓글의 zemix에서 무료로 써보세요!"
화면: ${project.title} 데모 시연 및 zemix 링크 클릭`;

  const currentContent =
    activeTab === "geeknews" ? geeknewsDraft : activeTab === "velog" ? velogDraft : shortsDraft;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">AI 런칭 보도자료 & 홍보글 생성기</h3>
              <p className="text-xs text-muted">긱뉴스, 벨로그, 쇼츠에 바로 복사해 올릴 수 있는 맞춤 글</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("geeknews")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "geeknews" ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface-muted text-muted hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>긱뉴스 Show 초안</span>
          </button>
          <button
            onClick={() => setActiveTab("velog")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "velog" ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface-muted text-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>벨로그 회고록 초안</span>
          </button>
          <button
            onClick={() => setActiveTab("shorts")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "shorts" ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface-muted text-muted hover:text-foreground"
            }`}
          >
            <Play className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>30초 쇼츠 대본</span>
          </button>
        </div>

        {/* Text Area Content */}
        <div className="mt-4 relative">
          <textarea
            readOnly
            value={currentContent}
            rows={12}
            className="w-full rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs text-slate-200 outline-none leading-relaxed resize-none"
          />
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary-hover transition-all cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "복사 완료! ✅" : "전체 복사"}</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <span>* 프로젝트 정보를 기반으로 실시간 자동 작성된 초안입니다.</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-3.5 py-1.5 font-semibold text-muted hover:bg-surface-muted"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
