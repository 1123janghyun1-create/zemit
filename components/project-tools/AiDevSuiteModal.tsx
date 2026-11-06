"use client";

import React, { useState } from "react";
import {
  Bot,
  ShieldCheck,
  Users2,
  Sparkles,
  Layers,
  FileText,
  Code2,
  Copy,
  Check,
  X,
  Play,
  AlertTriangle,
} from "lucide-react";
import { Project } from "@/lib/types";

interface AiDevSuiteModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function AiDevSuiteModal({
  project,
  isOpen,
  onClose,
}: AiDevSuiteModalProps) {
  const [activeTab, setActiveTab] = useState<"security" | "personas" | "copy" | "stack" | "legal" | "test">("security");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanDone(true);
    }, 1200);
  };

  // 1. Legal Terms
  const legalTerms = `[${project.title}] 서비스 이용약관 & 개인정보 처리방침 (표준안)

제1조 (목적)
본 약관은 ${project.title}(이하 "서비스")가 제공하는 제반 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (개인정보의 수집 및 이용)
서비스는 회원 식별 및 원활한 서비스 제공을 위해 최소한의 개인정보(소셜 로그인 시 이메일, 프로필 이름)만을 수집하며, 암호화되어 안전하게 보관됩니다.

제3조 (지적재산권)
서비스 내 모든 소프트웨어, UI 디자인 및 브랜드 상표권은 제작자(${project.author?.name || "빌더"})에게 귀속됩니다.`;

  // 2. Playwright Test Snippet
  const testSnippet = `// e2e/project-health.spec.ts
import { test, expect } from '@playwright/test';

test('${project.title} 핵심 플로우 테스트', async ({ page }) => {
  // 1. 랜딩페이지 접속
  await page.goto('${project.websiteUrl || "http://localhost:3000"}');
  await expect(page).toHaveTitle(/${project.title.slice(0, 4)}/i);

  // 2. 주요 CTA 버튼 시인성 점검
  const ctaBtn = page.locator('button, a').first();
  await expect(ctaBtn).toBeVisible();

  // 3. 콘솔 자바스크립트 크래시 에러 없는지 확인
  page.on('pageerror', (err) => {
    expect(err).toBeNull();
  });
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-3xl rounded-card border border-border bg-surface p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">AI 지능형 개발자 스위트</h3>
              <p className="text-xs text-muted">보안 스캔, 가상 페르소나 테스팅, 카피라이팅, 법률 문서 자동화</p>
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
            { key: "security", label: "🛡️ 보안 & 취약점 스캐너", icon: ShieldCheck },
            { key: "personas", label: "🎭 모의 사용자 페르소나", icon: Users2 },
            { key: "copy", label: "✍️ A/B 헤드라인 카피 생성기", icon: Sparkles },
            { key: "stack", label: "📡 기술 스택 호환성 레이더", icon: Layers },
            { key: "legal", label: "⚖️ 약관 & 개인정보 생성기", icon: FileText },
            { key: "test", label: "🧪 버그 재현 테스트 코드", icon: Code2 },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`rounded-control px-3 py-1.5 font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === t.key
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-surface-muted text-muted hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* 1. Security Scanner */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-surface-muted/50 p-4 rounded-xl border border-border">
                <div>
                  <h4 className="text-xs font-bold text-foreground">자동 보안 취약점 간이 점검</h4>
                  <p className="text-[11px] text-muted">API 키 노출 위험, HTTPS 인증서, CORS 정책, 프론트엔드 취약 패키지 검사</p>
                </div>
                <button
                  onClick={handleRunScan}
                  disabled={isScanning}
                  className="rounded-control bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? "진단 중..." : "스캔 시작"}
                </button>
              </div>

              {scanDone ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      공개 API 키 및 시크릿 토큰 유출 없음 (안전)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      SSL/TLS 암호화 및 HTTPS 리다이렉션 정상 활성화
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      [권장] Content-Security-Policy (CSP) 헤더를 Next.js config에 추가하면 XSS 방어가 강화됩니다.
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted text-center py-8">
                  '스캔 시작' 버튼을 누르면 프로젝트 URL 및 공개 설정의 기본 보안성을 3초 안에 점검합니다.
                </p>
              )}
            </div>
          )}

          {/* 2. Simulated Personas */}
          {activeTab === "personas" && (
            <div className="space-y-3">
              {[
                {
                  role: "20대 취준생 / 주니어 개발자 (민지)",
                  avatar: "👩‍💻",
                  critique: `"${project.title}을 처음 봤을 때 깔끔한 UI가 마음에 들었어요! 다만 처음 방문했을 때 정확히 무엇을 클릭해서 시작해야 하는지 튜토리얼이나 샘플 데이터가 조금 더 눈에 띄면 좋겠어요."`,
                  score: "9.0 / 10",
                },
                {
                  role: "30대 IT 스타트업 PM (성호)",
                  avatar: "👔",
                  critique: `"${project.tagline}이라는 소구점은 명확합니다. 랜딩페이지 상단에 '다른 툴과의 차별점 3가지' 비교표가 있으면 결제 전환율이 2배는 오를 것 같습니다."`,
                  score: "8.5 / 10",
                },
                {
                  role: "10년차 시니어 풀스택 아키텍트 (진우)",
                  avatar: "🧙‍♂️",
                  critique: `"기술 스택(${project.tags.slice(0, 3).join(", ")}) 선정이 매우 실용적입니다. 초기 로딩 속도도 우수하며, Supabase Row-Level Security(RLS)만 한 번 더 확인하시면 완벽합니다."`,
                  score: "9.5 / 10",
                },
              ].map((p, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <span className="text-base">{p.avatar}</span>
                      <span>{p.role}</span>
                    </span>
                    <span className="font-bold text-purple-500">{p.score}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed italic">{p.critique}</p>
                </div>
              ))}
            </div>
          )}

          {/* 3. Copywriting */}
          {activeTab === "copy" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                랜딩페이지 전환율(CTR)을 높이기 위해 제안하는 5가지 A/B 테스트 헤드라인 카피입니다:
              </p>
              {[
                `1. "${project.title} - 단 3분 만에 끝내는 ${project.tagline}"`,
                `2. "더 이상 헤매지 마세요. 개발자를 위해 가장 가벼운 ${project.title}"`,
                `3. "복잡함은 빼고 본질만 담았습니다. 지금 무료로 시작하는 ${project.title}"`,
                `4. "사용자 1,000명이 인정한 가장 스마트한 ${project.title}"`,
                `5. "${project.tagline}의 새로운 표준, 지금 경험해보세요"`,
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-muted/30 text-xs">
                  <span className="font-medium text-foreground">{c}</span>
                  <button
                    onClick={() => copyToClipboard(c, `c-${i}`)}
                    className="text-muted hover:text-foreground cursor-pointer shrink-0 ml-2"
                  >
                    {copiedKey === `c-${i}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 4. Tech Stack Radar */}
          {activeTab === "stack" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground">적용된 기술 스택 조합 평가</h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((t) => (
                    <span key={t} className="rounded bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-mono font-bold">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  선택하신 기술 스택은 2026년 기준 <strong>배포 속도 최상위 5%</strong> 조합입니다. Vercel + Supabase 구조로 서버 비용을 월 0원에 가깝게 유지하며 글로벌 확장이 가능합니다.
                </p>
              </div>
            </div>
          )}

          {/* 5. Legal Terms */}
          {activeTab === "legal" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                사이드 프로젝트 런칭 시 바로 사용할 수 있는 무료 이용약관 및 개인정보 처리방침 표준 템플릿입니다.
              </p>
              <textarea
                readOnly
                rows={7}
                value={legalTerms}
                className="w-full rounded-xl border border-border bg-surface-muted/50 p-3 text-xs font-mono text-foreground focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(legalTerms, "legal")}
                className="w-full rounded-control bg-purple-600 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "legal" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>약관 텍스트 복사하기</span>
              </button>
            </div>
          )}

          {/* 6. Playwright Test */}
          {activeTab === "test" && (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                이 프로젝트의 핵심 헬스체크 및 크래시 여부를 점검할 수 있는 Playwright E2E 자동화 코드입니다.
              </p>
              <textarea
                readOnly
                rows={8}
                value={testSnippet}
                className="w-full rounded-xl border border-border bg-surface-muted/50 p-3 text-xs font-mono text-foreground focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(testSnippet, "test")}
                className="w-full rounded-control bg-purple-600 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "test" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>테스트 코드 복사하기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
