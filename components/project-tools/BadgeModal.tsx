"use client";

import React, { useState } from "react";
import { X, Copy, Check, Award, ExternalLink, Code } from "lucide-react";

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export default function BadgeModal({ isOpen, onClose, projectId, projectTitle }: BadgeModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://zemix.kr";
  const badgeUrl = `${siteUrl}/api/badge/${projectId}`;
  const projectUrl = `${siteUrl}/projects/${projectId}`;

  const markdownCode = `[![Featured on zemix](${badgeUrl})](${projectUrl})`;
  const htmlCode = `<a href="${projectUrl}" target="_blank"><img src="${badgeUrl}" alt="Featured on zemix" /></a>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">"Featured on zemix" 뱃지 발급</h3>
              <p className="text-xs text-muted">깃허브 README나 공식 웹사이트에 실시간 뱃지를 달아보세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Badge Preview */}
        <div className="mt-5 rounded-xl border border-border/80 bg-slate-950 p-6 flex flex-col items-center justify-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 mb-1">실시간 SVG 뱃지 미리보기</span>
          <img src={`/api/badge/${projectId}`} alt="Featured on zemix" className="h-7 shadow-lg" />
          <span className="text-[10px] text-slate-500 mt-1">조회수와 좋아요가 실시간으로 자동 갱신됩니다</span>
        </div>

        {/* Markdown Embed */}
        <div className="mt-5 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-primary" />
                GitHub README (Markdown)
              </label>
              <button
                onClick={() => copyToClipboard(markdownCode, "md")}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                {copiedType === "md" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copiedType === "md" ? "복사 완료!" : "마크다운 복사"}</span>
              </button>
            </div>
            <div className="rounded-xl border border-border bg-surface-muted p-2.5 font-mono text-xs text-foreground/80 overflow-x-auto">
              {markdownCode}
            </div>
          </div>

          {/* HTML Embed */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-purple-500" />
                웹사이트 하단 (HTML)
              </label>
              <button
                onClick={() => copyToClipboard(htmlCode, "html")}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                {copiedType === "html" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copiedType === "html" ? "복사 완료!" : "HTML 복사"}</span>
              </button>
            </div>
            <div className="rounded-xl border border-border bg-surface-muted p-2.5 font-mono text-xs text-foreground/80 overflow-x-auto">
              {htmlCode}
            </div>
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
