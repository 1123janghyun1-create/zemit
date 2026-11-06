"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Trophy, Heart, MessageSquare, Rocket, Share2, Download, ArrowRight, ArrowLeft } from "lucide-react";
import { HexagonLogo } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";
import { getProjects, getBuilderXp } from "@/lib/storage";

export default function WrappedClient() {
  const { user } = useAuth();
  const [slide, setSlide] = useState(0);

  const myProjects = getProjects().filter((p) => p.author?.id === user?.id);
  const totalLikes = myProjects.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const xpInfo = getBuilderXp(user?.id || "guest");

  const slides = [
    {
      title: "2026 zemix 빌더 랩드",
      subtitle: `${user?.name || "메이커"}님의 눈부신 1년간의 메이킹 여정`,
      stat: `Lv.${xpInfo.level} ${xpInfo.tier}`,
      detail: `올해 총 ${xpInfo.xp} XP를 획득하며 커뮤니티 상위 5% 빌더로 성장하셨습니다.`,
      bg: "from-sky-600 via-blue-700 to-indigo-900",
      icon: Trophy,
    },
    {
      title: "런칭한 사이드 프로젝트",
      subtitle: "아이디어를 현실로 옮긴 위대한 순간들",
      stat: `${myProjects.length || 2}개 프로젝트`,
      detail: "대부분의 사람들은 생각만 할 때, 당신은 직접 코드를 작성하고 세상에 공개했습니다.",
      bg: "from-violet-600 via-purple-700 to-slate-900",
      icon: Rocket,
    },
    {
      title: "동료 메이커들이 보낸 사랑",
      subtitle: "당신의 프로덕트에 쏟아진 따뜻한 공감",
      stat: `${totalLikes || 148}개의 하트`,
      detail: "당신의 서비스는 수많은 유저와 빌더들에게 영감과 실질적인 도움을 선물했습니다.",
      bg: "from-rose-600 via-pink-700 to-amber-900",
      icon: Heart,
    },
    {
      title: "2027년에도 계속될 당신의 빌드",
      subtitle: "Meet users. Build together.",
      stat: "Keep Shipping! 🚀",
      detail: "zemix는 언제나 당신의 다음 사이드 프로젝트와 대담한 도전을 가장 가까이서 응원합니다.",
      bg: "from-emerald-600 via-teal-700 to-cyan-900",
      icon: Sparkles,
    },
  ];

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 text-white">
      {/* Container */}
      <div className="max-w-md w-full space-y-6">
        {/* Navigation Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <HexagonLogo className="h-4 w-4 text-sky-400" />
            <span className="font-bold tracking-tight text-white">zemix Wrapped</span>
          </div>
          <div className="flex items-center gap-1">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  slide === i ? "w-6 bg-sky-400" : "w-2 bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 9:16 Story Card */}
        <div
          className={`aspect-[9/16] w-full rounded-3xl p-8 flex flex-col justify-between shadow-2xl bg-gradient-to-br ${current.bg} border border-white/20 transition-all duration-500 relative overflow-hidden`}
        >
          {/* Top */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold">
              <Icon className="h-3.5 w-3.5" />
              <span>{current.title}</span>
            </div>
            <p className="text-xs text-white/80">{current.subtitle}</p>
          </div>

          {/* Center Stat */}
          <div className="text-center py-8 space-y-3">
            <div className="flex justify-center mb-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
                <Icon className="h-8 w-8 text-white" />
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">
              {current.stat}
            </h2>
            <p className="text-xs md:text-sm text-white/90 leading-relaxed max-w-xs mx-auto drop-shadow-sm">
              {current.detail}
            </p>
          </div>

          {/* Bottom Branding */}
          <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/80">
            <div className="flex items-center gap-2">
              <img
                src={user?.avatar || "/icon.png"}
                alt={user?.name || "User"}
                className="h-6 w-6 rounded-full border border-white/40 object-cover"
              />
              <span className="font-bold">{user?.name || "인디 빌더"}</span>
            </div>
            <span className="font-mono text-[10px] tracking-wider uppercase opacity-75">
              zemix.vercel.app
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setSlide((prev) => Math.max(0, prev - 1))}
            disabled={slide === 0}
            className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "나의 2026 zemix 빌더 랩드",
                  text: `${user?.name || "메이커"}님의 2026년 zemix 사이드 프로젝트 성과를 확인해보세요!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("랩드 링크가 클립보드에 복사되었습니다!");
              }
            }}
            className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-400 py-3 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>스토리 & X(트위터)에 자랑하기</span>
          </button>

          <button
            onClick={() => setSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={slide === slides.length - 1}
            className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← zemix 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
