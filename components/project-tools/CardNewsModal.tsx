"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  Palette,
  Sparkles,
  Type,
  Smile,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Project } from "@/lib/types";

interface CardNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

type AspectRatio = "square" | "story" | "landscape";
type ThemePreset = "neon" | "sunset" | "emerald" | "studio" | "obsidian";

const THEMES: Record<
  ThemePreset,
  {
    name: string;
    bgDesc: string;
    bgGradient: [string, string, string];
    cardBg: string;
    cardBorder: string;
    textColor: string;
    subTextColor: string;
    accentColor: string;
    pillBg: string;
    pillText: string;
  }
> = {
  neon: {
    name: "오로라 네온",
    bgDesc: "사이버네틱 네이비 & 시안 글로우",
    bgGradient: ["#070b19", "#0f172a", "#1e1b4b"],
    cardBg: "rgba(15, 23, 42, 0.88)",
    cardBorder: "rgba(56, 189, 248, 0.4)",
    textColor: "#ffffff",
    subTextColor: "#94a3b8",
    accentColor: "#38bdf8",
    pillBg: "rgba(56, 189, 248, 0.15)",
    pillText: "#38bdf8",
  },
  sunset: {
    name: "선셋 바이브",
    bgDesc: "따뜻한 마젠타 & 코랄 선셋",
    bgGradient: ["#180828", "#3b0764", "#831843"],
    cardBg: "rgba(35, 10, 50, 0.85)",
    cardBorder: "rgba(244, 63, 94, 0.4)",
    textColor: "#ffffff",
    subTextColor: "#fbcfe8",
    accentColor: "#fb7185",
    pillBg: "rgba(244, 63, 94, 0.2)",
    pillText: "#f43f5e",
  },
  emerald: {
    name: "테크 에메랄드",
    bgDesc: "깊은 슬레이트 & 민트 라이트",
    bgGradient: ["#022c22", "#064e3b", "#020617"],
    cardBg: "rgba(6, 40, 32, 0.88)",
    cardBorder: "rgba(52, 211, 153, 0.45)",
    textColor: "#ffffff",
    subTextColor: "#a7f3d0",
    accentColor: "#10b981",
    pillBg: "rgba(16, 185, 129, 0.2)",
    pillText: "#34d399",
  },
  studio: {
    name: "모던 클린",
    bgDesc: "화이트 스튜디오 & 다크 타이포",
    bgGradient: ["#ffffff", "#f1f5f9", "#e2e8f0"],
    cardBg: "rgba(255, 255, 255, 0.95)",
    cardBorder: "rgba(203, 213, 225, 0.9)",
    textColor: "#0f172a",
    subTextColor: "#64748b",
    accentColor: "#2563eb",
    pillBg: "rgba(37, 99, 235, 0.1)",
    pillText: "#2563eb",
  },
  obsidian: {
    name: "옵시디언 블랙",
    bgDesc: "미니멀리즘 딥 블랙 & 실버",
    bgGradient: ["#000000", "#09090b", "#18181b"],
    cardBg: "rgba(24, 24, 27, 0.88)",
    cardBorder: "rgba(161, 161, 170, 0.35)",
    textColor: "#ffffff",
    subTextColor: "#a1a1aa",
    accentColor: "#e4e4e7",
    pillBg: "rgba(255, 255, 255, 0.1)",
    pillText: "#ffffff",
  },
};

const HEADLINE_PRESETS = [
  "🚀 새로운 사이드 프로젝트를 소개합니다",
  "💡 이런 서비스가 필요해서 직접 만들었습니다",
  "🔥 지금 zemix에서 가장 주목받는 프로젝트",
  "🛠️ 인디 메이커의 열정이 담긴 프로덕트",
  "✨ 드디어 공식 런칭! 지금 바로 체험해보세요",
];

const STICKERS = ["없음", "🔥 HOT", "✨ NEW", "⭐ TOP PICK", "🚀 LAUNCHED", "🧪 BETA", "👥 팀원 모집"];

export default function CardNewsModal({ isOpen, onClose, project }: CardNewsModalProps) {
  const [ratio, setRatio] = useState<AspectRatio>("square");
  const [theme, setTheme] = useState<ThemePreset>("neon");
  const [headline, setHeadline] = useState(HEADLINE_PRESETS[0]);
  const [customTagline, setCustomTagline] = useState(project.tagline || "");
  const [selectedSticker, setSelectedSticker] = useState("🔥 HOT");
  const [showStats, setShowStats] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [customCta, setCustomCta] = useState("zemix에서 전체 프로젝트를 둘러보고 응원해 주세요!");

  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw canvas
  const renderCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 1080;
    let height = 1080;
    if (ratio === "story") {
      width = 1080;
      height = 1920;
    } else if (ratio === "landscape") {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;

    const t = THEMES[theme];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, t.bgGradient[0]);
    bgGrad.addColorStop(0.5, t.bgGradient[1]);
    bgGrad.addColorStop(1, t.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Glow Light
    const glow = ctx.createRadialGradient(
      width / 2,
      ratio === "story" ? height * 0.35 : height * 0.4,
      40,
      width / 2,
      ratio === "story" ? height * 0.35 : height * 0.4,
      width * 0.65
    );
    if (theme === "studio") {
      glow.addColorStop(0, "rgba(59, 130, 246, 0.12)");
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    } else {
      glow.addColorStop(0, t.accentColor + "33");
      glow.addColorStop(1, "transparent");
    }
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 3. Header Tag: Featured on zemix + Sticker
    const topY = ratio === "story" ? 140 : ratio === "landscape" ? 50 : 80;
    ctx.fillStyle = t.pillBg;
    ctx.strokeStyle = t.cardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 170, topY, 340, 52, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = t.pillText;
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      selectedSticker !== "없음"
        ? `${selectedSticker} • zemix 쇼케이스`
        : "🚀 Featured on zemix",
      width / 2,
      topY + 34
    );

    // 4. Headline Hook
    const headY = topY + (ratio === "story" ? 100 : ratio === "landscape" ? 75 : 85);
    ctx.fillStyle = t.textColor;
    ctx.font = `bold ${ratio === "landscape" ? 28 : 34}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(headline, width / 2, headY);

    // 5. Central Showcase Card
    let cardY = headY + (ratio === "story" ? 90 : ratio === "landscape" ? 45 : 55);
    let cardH = ratio === "story" ? 960 : ratio === "landscape" ? 340 : 540;
    const cardW = width - (ratio === "landscape" ? 140 : 120);
    const cardX = (width - cardW) / 2;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;

    ctx.fillStyle = t.cardBg;
    ctx.strokeStyle = t.cardBorder;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 32);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6. Project Logo inside Card
    const logoSize = ratio === "landscape" ? 80 : 100;
    const logoX = width / 2 - logoSize / 2;
    const logoY = cardY + (ratio === "landscape" ? 30 : 50);

    // Draw stylized logo squircle
    ctx.fillStyle = t.accentColor;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 22);
    ctx.fill();

    ctx.fillStyle = theme === "studio" ? "#ffffff" : "#030712";
    ctx.font = `bold ${logoSize * 0.45}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      (project.title || "P").slice(0, 1).toUpperCase(),
      width / 2,
      logoY + logoSize * 0.68
    );

    // 7. Project Title
    const titleY = logoY + logoSize + (ratio === "landscape" ? 38 : 50);
    ctx.fillStyle = t.textColor;
    ctx.font = `bold ${ratio === "landscape" ? 40 : 52}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(project.title, width / 2, titleY);

    // 8. Tagline
    const tagY = titleY + (ratio === "landscape" ? 38 : 46);
    ctx.fillStyle = t.subTextColor;
    ctx.font = `normal ${ratio === "landscape" ? 22 : 28}px sans-serif`;
    const tagText = customTagline || project.tagline || "";
    const maxChars = ratio === "landscape" ? 42 : 32;

    if (tagText.length <= maxChars) {
      ctx.fillText(tagText, width / 2, tagY);
    } else {
      ctx.fillText(tagText.slice(0, maxChars), width / 2, tagY);
      ctx.fillText(tagText.slice(maxChars, maxChars * 2), width / 2, tagY + 36);
    }

    // 9. Stats Pill (Likes & Views)
    if (showStats) {
      const statsY =
        ratio === "landscape"
          ? cardY + cardH - 65
          : ratio === "story"
          ? tagY + 120
          : tagY + 70;
      const statsW = 380;
      ctx.fillStyle = t.pillBg;
      ctx.beginPath();
      ctx.roundRect(width / 2 - statsW / 2, statsY, statsW, 58, 20);
      ctx.fill();

      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#f43f5e";
      ctx.textAlign = "center";
      ctx.fillText(`❤️ ${project.likesCount || 0} Likes`, width / 2 - 90, statsY + 38);

      ctx.fillStyle = t.accentColor;
      ctx.fillText(`👀 ${project.viewsCount || 0} Views`, width / 2 + 90, statsY + 38);
    }

    // 10. Tags
    if (showTags && (project.tags || []).length > 0) {
      const tags = project.tags.slice(0, 4);
      const tagBoxY =
        ratio === "landscape"
          ? cardY + cardH - 120
          : ratio === "story"
          ? cardY + 540
          : cardY + cardH - 85;

      const tagW = 120;
      const gap = 12;
      const totalW = tags.length * tagW + (tags.length - 1) * gap;
      const startX = width / 2 - totalW / 2;

      tags.forEach((tag, idx) => {
        const x = startX + idx * (tagW + gap);
        ctx.fillStyle = theme === "studio" ? "rgba(226, 232, 240, 0.8)" : "rgba(51, 65, 85, 0.7)";
        ctx.beginPath();
        ctx.roundRect(x, tagBoxY, tagW, 40, 12);
        ctx.fill();

        ctx.fillStyle = t.textColor;
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`#${tag.slice(0, 6)}`, x + tagW / 2, tagBoxY + 26);
      });
    }

    // 11. Author Attribution (for story mode)
    if (ratio === "story" && project.author) {
      const authorY = cardY + 680;
      ctx.fillStyle = t.subTextColor;
      ctx.font = "normal 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`만든 사람 • @${project.author.handle || "maker"}`, width / 2, authorY);
    }

    // 12. Bottom Watermark & CTA
    const botY = ratio === "story" ? height - 160 : ratio === "landscape" ? height - 60 : height - 100;
    ctx.fillStyle = t.accentColor;
    ctx.font = `bold ${ratio === "landscape" ? 22 : 26}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(customCta, width / 2, botY);

    ctx.fillStyle = t.subTextColor;
    ctx.font = `normal ${ratio === "landscape" ? 17 : 20}px sans-serif`;
    ctx.fillText("zemix.vercel.app • 대한민국 인디 메이커 커뮤니티", width / 2, botY + 36);

    try {
      setDownloadUrl(canvas.toDataURL("image/png"));
    } catch {}
  }, [
    ratio,
    theme,
    headline,
    customTagline,
    selectedSticker,
    showStats,
    showTags,
    customCta,
    project,
  ]);

  useEffect(() => {
    if (isOpen) {
      renderCard();
    }
  }, [isOpen, renderCard]);

  // Copy to clipboard
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      alert("클립보드 복사 기능을 지원하지 않는 브라우저입니다. 이미지 다운로드를 이용해 주세요.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-muted/30">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">
                SNS 카드뉴스 스튜디오 (Card News Studio)
              </h3>
              <p className="text-xs text-muted">
                인스타그램, 스레드, X(트위터), 링크드인 공유용 고화질 카드를 자유롭게 꾸며보세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-surface-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 p-6">
          {/* Left: Canvas Preview */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-slate-950 p-4 sm:p-6 min-h-[460px] max-h-[580px] overflow-hidden relative group">
            <canvas
              ref={canvasRef}
              className="max-h-[480px] max-w-full rounded-xl shadow-2xl object-contain border border-slate-800 transition-transform duration-200 group-hover:scale-[1.01]"
            />
            <span className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-mono bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
              {ratio === "square" ? "1080 × 1080" : ratio === "story" ? "1080 × 1920" : "1200 × 675"}
            </span>
          </div>

          {/* Right: Customization Controls */}
          <div className="space-y-5 overflow-y-auto max-h-[580px] pr-1">
            {/* 1. Format / Ratio */}
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>포맷 / 크기</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: "square", label: "1:1 피드", sub: "인스타/X" },
                  { key: "story", label: "9:16 스토리", sub: "릴스/쇼츠" },
                  { key: "landscape", label: "16:9 와이드", sub: "X 카드/링크드인" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRatio(item.key as AspectRatio)}
                    className={`rounded-xl p-2 text-center border transition-all cursor-pointer ${
                      ratio === item.key
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-surface text-muted hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Theme Preset */}
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                <Palette className="h-3.5 w-3.5 text-purple-500" />
                <span>컬러 테마 & 배경</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as ThemePreset[]).map((key) => {
                  const t = THEMES[key];
                  const isSelected = theme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTheme(key)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-surface hover:bg-surface-muted"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${t.bgGradient[0]}, ${t.accentColor})`,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-foreground truncate">{t.name}</div>
                        <div className="text-[10px] text-muted truncate">{t.bgDesc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Sticker Badge */}
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                <Smile className="h-3.5 w-3.5 text-amber-500" />
                <span>스티커 뱃지</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STICKERS.map((stk) => (
                  <button
                    key={stk}
                    type="button"
                    onClick={() => setSelectedSticker(stk)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      selectedSticker === stk
                        ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                        : "bg-surface-muted border border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {stk}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Headline / Hook */}
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                <Type className="h-3.5 w-3.5 text-primary" />
                <span>상단 헤드라인 문구</span>
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {HEADLINE_PRESETS.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHeadline(h)}
                    className="text-[10px] text-muted hover:text-primary underline text-left cursor-pointer"
                  >
                    • {h.slice(0, 18)}...
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Custom Tagline */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                소개 문구 (Tagline)
              </label>
              <input
                type="text"
                value={customTagline}
                onChange={(e) => setCustomTagline(e.target.value)}
                placeholder="프로젝트 한 줄 소개"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
              />
            </div>

            {/* 6. Display Toggles */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={(e) => setShowStats(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>좋아요/조회수 표시</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showTags}
                  onChange={(e) => setShowTags(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>태그 표시</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-6 py-4 bg-surface-muted/30">
          <span className="text-xs text-muted">
            인스타그램, 스레드, X 등에 바로 붙여넣기하거나 다운로드하세요.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "클립보드 복사됨!" : "이미지 복사"}</span>
            </button>

            <a
              href={downloadUrl}
              download={`${project.title}_zemix_card.png`}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer shadow-sm shadow-primary/20"
            >
              <Download className="h-4 w-4" />
              <span>PNG 다운로드</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}