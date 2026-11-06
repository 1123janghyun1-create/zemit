"use client";

import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  Video,
  Code,
  Trophy,
  ExternalLink,
  Sparkles,
  Award,
} from "lucide-react";
import { TwitterIcon } from "@/components/Icons";
import { Project } from "@/lib/types";

interface GrowthAndViralModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function GrowthAndViralModal({
  project,
  isOpen,
  onClose,
}: GrowthAndViralModalProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "x_threads" | "geeknews" | "youtube" | "widget">("daily");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hasVotedDaily, setHasVotedDaily] = useState(false);
  const [dailyVotes, setDailyVotes] = useState(project.likesCount + 12);

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://zemix.vercel.app/projects/${project.id}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Tweet/Threads Text
  const tweetText = `🚀 방금 zemix에 제 사이드 프로젝트 '${project.title}'을 런칭했습니다!\n\n"${project.tagline}"\n\n📌 서비스 둘러보기: ${project.websiteUrl || currentUrl}\n💬 피드백 남기기: ${currentUrl}\n\n#사이드프로젝트 #인디해커 #개발자 #zemix`;

  // 2. GeekNews / Disquiet Markdown Template
  const geeknewsMarkdown = `## [런칭] ${project.title} - ${project.tagline}

안녕하세요! 사이드 프로젝트 메이커입니다. 이번에 zemix를 통해 **${project.title}**을 공식 공개하게 되었습니다.

### 💡 서비스 기획 배경
${project.description || "기존 서비스들의 불편한 점을 개선하고, 사용자에게 더 직관적인 경험을 제공하고자 기획했습니다."}

### 🛠️ 주요 기술 스택
${project.tags.map((t) => `- ${t}`).join("\n")}

### 🔗 링크
- **서비스 바로가기**: ${project.websiteUrl || currentUrl}
- **zemix 쇼케이스 & 피드백**: ${currentUrl}

많은 피드백과 조언 부탁드립니다! 감사합니다.`;

  // 3. YouTube Creator Pitch Email Template
  const youtubePitch = `제목: [리뷰 제안] 신규 사이드 프로젝트 '${project.title}'을 소개해 주실 수 있을까요?

안녕하세요 크리에이터님,
평소 영상을 너무나 유익하게 챙겨보고 있는 구독자이자 인디 개발자입니다!

이번에 "${project.tagline}"이라는 목표로 [${project.title}] 서비스를 새롭게 런칭했습니다.
혹시 시청자분들께 흥미로운 토이 프로젝트 또는 유용한 생산성 툴로 소개해 주실 수 있을지 조심스럽게 메일 드립니다.

- 서비스명: ${project.title}
- 라이브 데모 URL: ${project.websiteUrl || currentUrl}
- 개발 배경 & 피드백: ${currentUrl}

원하시는 경우 전 기능 무료 VIP 평생 이용권 및 시청자분들을 위한 특별 프로모션 쿠폰을 제공해 드릴 수 있습니다.
바쁘신 와중 읽어주셔서 진심으로 감사드립니다!`;

  // 4. Testimonial Widget Embed Code
  const widgetCode = `<div id="zemix-testimonial-widget" data-project-id="${project.id}"></div>
<script src="https://zemix.vercel.app/widgets/testimonial.js" async></script>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-card border border-border bg-surface p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Share2 className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">바이럴 & 홍보 툴킷</h3>
              <p className="text-xs text-muted">트래픽 유입과 커뮤니티 바이럴을 극대화하는 원클릭 도구 모음</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-border scrollbar-none text-xs">
          {[
            { key: "daily", label: "🥇 오늘의 1위 투표 (Daily)", icon: Trophy },
            { key: "x_threads", label: "🐦 X & 스레드 런칭 봇", icon: TwitterIcon },
            { key: "geeknews", label: "📋 긱뉴스/디스콰이엇 포맷", icon: Copy },
            { key: "youtube", label: "📺 유튜버 리뷰 요청", icon: Video },
            { key: "widget", label: "🌐 라이브 후기 위젯", icon: Code },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`rounded-control px-3 py-1.5 font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-muted text-muted hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* 1. Daily Vote */}
          {activeTab === "daily" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-500">
                  <Award className="h-4 w-4" />
                  Product of the Day 랭킹 배틀
                </span>
                <h4 className="text-xl font-black text-foreground">
                  오늘의 1위 프로덕트에 투표하세요!
                </h4>
                <p className="text-xs text-muted max-w-md mx-auto">
                  매일 자정 가장 많은 지지를 받은 서비스는 내일 하루 동안 zemix 메인 최상단 골드 배너에 박제되고 "Today's #1 Winner" 디지털 트로피를 영구 획득합니다.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!hasVotedDaily) {
                        setDailyVotes((v) => v + 1);
                        setHasVotedDaily(true);
                      }
                    }}
                    className={`rounded-xl py-3 px-6 text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-2 ${
                      hasVotedDaily
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold"
                    }`}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>
                      {hasVotedDaily
                        ? `✓ 투표 완료! (현재 ${dailyVotes}표)`
                        : `이 프로젝트에 오늘 1위 투표하기 (${dailyVotes}표)`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. X / Threads */}
          {activeTab === "x_threads" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                런칭 소식을 SNS에 올릴 때 바로 쓸 수 있는 해시태그 & 링크 맞춤형 포스팅 텍스트입니다.
              </p>
              <textarea
                readOnly
                rows={6}
                value={tweetText}
                className="w-full rounded-xl border border-border bg-surface-muted/50 p-3 text-xs font-mono text-foreground focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(tweetText, "tweet")}
                  className="flex-1 rounded-control bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === "tweet" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === "tweet" ? "복사 완료!" : "트윗 문구 복사"}</span>
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-control border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1.5"
                >
                  <TwitterIcon className="h-3.5 w-3.5 text-sky-400" />
                  <span>X에서 즉시 트윗 열기</span>
                </a>
              </div>
            </div>
          )}

          {/* 3. GeekNews / Disquiet */}
          {activeTab === "geeknews" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                긱뉴스(GeekNews) 또는 디스콰이엇(Disquiet) 마크다운 에디터에 붙여넣기만 하면 되는 정형화된 소개 템플릿입니다.
              </p>
              <textarea
                readOnly
                rows={7}
                value={geeknewsMarkdown}
                className="w-full rounded-xl border border-border bg-surface-muted/50 p-3 text-xs font-mono text-foreground focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(geeknewsMarkdown, "geek")}
                className="w-full rounded-control bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "geek" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === "geek" ? "마크다운 복사 완료!" : "마크다운 전체 복사하기"}</span>
              </button>
            </div>
          )}

          {/* 4. YouTube Pitch */}
          {activeTab === "youtube" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                테크 유튜버 및 인플루언서에게 서비스 리뷰를 정중하게 요청할 수 있는 콜드 메일(Cold Email) 양식입니다.
              </p>
              <textarea
                readOnly
                rows={8}
                value={youtubePitch}
                className="w-full rounded-xl border border-border bg-surface-muted/50 p-3 text-xs font-mono text-foreground focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(youtubePitch, "yt")}
                className="w-full rounded-control bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "yt" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === "yt" ? "이메일 본문 복사 완료!" : "피칭 이메일 본문 복사"}</span>
              </button>
            </div>
          )}

          {/* 5. Live Testimonial Widget */}
          {activeTab === "widget" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                개발자 본인의 웹사이트 하단에 zemix에서 받은 실시간 5점 만점 평점과 유저 후기를 띄울 수 있는 1줄 자바스크립트 코드입니다.
              </p>
              <textarea
                readOnly
                rows={4}
                value={widgetCode}
                className="w-full rounded-xl border border-border bg-surface-muted/50 p-3 text-xs font-mono text-foreground focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(widgetCode, "widget")}
                className="w-full rounded-control bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "widget" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === "widget" ? "임베드 코드 복사 완료!" : "임베드 코드 복사하기"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
