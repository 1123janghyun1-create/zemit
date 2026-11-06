"use client";

import React, { useState } from "react";
import { X, Smartphone, Monitor, RotateCcw, ExternalLink, ShieldCheck } from "lucide-react";

interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteUrl: string;
  projectTitle: string;
}

export default function SandboxModal({ isOpen, onClose, websiteUrl, projectTitle }: SandboxModalProps) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen || !websiteUrl) return null;

  const reloadIframe = () => setIframeKey((prev) => prev + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 md:p-6 backdrop-blur-md animate-fade-in">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl bg-surface-muted p-1 border border-border">
              <button
                onClick={() => setDevice("mobile")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  device === "mobile" ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>모바일</span>
              </button>
              <button
                onClick={() => setDevice("desktop")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  device === "desktop" ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>데스크탑</span>
              </button>
            </div>

            <button
              onClick={reloadIframe}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
              title="새로고침"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* URL bar */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-1.5 text-xs text-muted max-w-sm truncate">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate font-mono">{websiteUrl}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
            >
              <span>새 탭으로 열기</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-muted text-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
          {device === "mobile" ? (
            /* iPhone Frame */
            <div className="relative h-[680px] w-[360px] rounded-[44px] border-8 border-slate-800 bg-black shadow-2xl overflow-hidden flex flex-col">
              <div className="h-6 w-full bg-slate-900 flex justify-center items-center shrink-0">
                <div className="h-3.5 w-24 rounded-full bg-black" />
              </div>
              <iframe
                key={iframeKey}
                src={websiteUrl}
                title={projectTitle}
                className="w-full flex-1 border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            /* Desktop Frame */
            <div className="h-full w-full max-w-4xl rounded-2xl border-2 border-slate-800 bg-black shadow-2xl overflow-hidden flex flex-col">
              <div className="h-7 w-full bg-slate-900 border-b border-slate-800 flex items-center px-3 gap-1.5 shrink-0">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <iframe
                key={iframeKey}
                src={websiteUrl}
                title={projectTitle}
                className="w-full flex-1 border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
