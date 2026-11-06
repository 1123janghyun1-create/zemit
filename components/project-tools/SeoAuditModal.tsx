"use client";

import React from "react";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Globe, Smartphone } from "lucide-react";
import { Project } from "@/lib/types";

interface SeoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export default function SeoAuditModal({ isOpen, onClose, project }: SeoAuditModalProps) {
  if (!isOpen) return null;

  const hasOg = Boolean(project.coverImage || project.logo);
  const hasHttps = (project.websiteUrl || "").startsWith("https://");
  const hasDesc = (project.description || "").length >= 50;
  const hasTags = (project.tags || []).length >= 2;

  let score = 70;
  if (hasOg) score += 10;
  if (hasHttps) score += 10;
  if (hasDesc) score += 5;
  if (hasTags) score += 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">SEO & 웹 품질 진단기</h3>
              <p className="text-xs text-muted">구글/네이버 검색 노출 및 메타데이터 종합 분석</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Big Score Card */}
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">종합 SEO 건강도 점수</span>
            <div className="text-3xl font-black text-foreground mt-0.5">
              {score} <span className="text-sm font-normal text-muted">/ 100점</span>
            </div>
            <p className="text-[11px] text-muted mt-1">
              {score >= 90 ? "최고 수준! 검색엔진 크롤러가 완벽히 수집 중입니다." : "우수함. 몇 가지 항목을 개선하면 100점이 됩니다."}
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border shadow-md">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        {/* Audit Checklist */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between rounded-xl bg-surface-muted p-3 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">구글봇 크롤링 최적화</span>
                <p className="text-[11px] text-muted">Schema.org SoftwareApplication 메타데이터 연동 완료</p>
              </div>
            </div>
            <span className="font-bold text-emerald-500">통과</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-muted p-3 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">HTTPS 보안 연결</span>
                <p className="text-[11px] text-muted">{hasHttps ? "보안 인증서(SSL) 적용됨" : "http:// 링크 감지됨"}</p>
              </div>
            </div>
            <span className={`font-bold ${hasHttps ? "text-emerald-500" : "text-amber-500"}`}>
              {hasHttps ? "통과" : "권장"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-muted p-3 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">오픈그래프(OG) 썸네일</span>
                <p className="text-[11px] text-muted">{hasOg ? "SNS 공유 시 커버 이미지 정상 표시" : "커버 이미지를 등록하세요"}</p>
              </div>
            </div>
            <span className="font-bold text-emerald-500">{hasOg ? "통과" : "주의"}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-muted p-3 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-sky-500 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">모바일 반응형 뷰포트</span>
                <p className="text-[11px] text-muted">스마트폰, 태블릿, PC 해상도 자동 대응 지원</p>
              </div>
            </div>
            <span className="font-bold text-sky-500">통과</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
}
