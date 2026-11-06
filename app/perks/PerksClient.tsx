"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Gift, Copy, Check, ExternalLink, Sparkles, Shield, ArrowRight, Handshake } from "lucide-react";
import { getPerks } from "@/lib/storage";
import { PerkItem } from "@/lib/types";

export default function PerksClient() {
  const [perks] = useState<PerkItem[]>(getPerks());
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorSubmitted, setSponsorSubmitted] = useState(false);

  const categories = ["All", "Hosting & Cloud", "Database & Backend", "AI & APIs", "Productivity", "Design"];

  const filtered = selectedCat === "All" ? perks : perks.filter((p) => p.category === selectedCat);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface-muted/30 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Gift className="h-3.5 w-3.5" />
            <span>빌더 독점 파트너스 혜택</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            B2B SaaS 무료 체험 & 개발자 크레딧 몰
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted max-w-2xl mx-auto">
            인디 메이커와 사이드 프로젝트 빌더들이 서버 비용 걱정 없이 출시할 수 있도록 Supabase, Cloudflare, Resend 등의 특별 제휴 프로모션 코드를 제공합니다.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowSponsorModal(true)}
              className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <Handshake className="h-4 w-4" />
              스폰서십 & 파트너 제휴 신청
            </button>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-control border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            >
              프로젝트 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 pt-10">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-border">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCat === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {filtered.map((perk) => (
            <div
              key={perk.id}
              className="rounded-card border border-border bg-surface p-6 shadow-card hover:border-primary/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={perk.logo}
                      alt={perk.provider}
                      className="h-12 w-12 rounded-xl object-cover border border-border shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <span className="text-[11px] font-semibold text-primary tracking-wide uppercase">
                        {perk.provider}
                      </span>
                      <h3 className="text-base font-bold text-foreground">{perk.name}</h3>
                    </div>
                  </div>
                  {perk.isFeatured && (
                    <span className="shrink-0 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      인기
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-muted leading-relaxed">{perk.tagline}</p>

                <div className="mt-4 rounded-xl bg-surface-muted/60 border border-border/80 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-muted block">할인 혜택</span>
                    <span className="text-xs font-bold text-foreground">{perk.discount}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-muted block">프로모션 코드</span>
                    <button
                      onClick={() => handleCopyCode(perk.code)}
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      {perk.code}
                      {copiedCode === perk.code ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                <span className="text-[11px] text-muted">
                  카테고리: <strong className="text-foreground">{perk.category}</strong>
                </span>
                <a
                  href={perk.claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-control bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>혜택 바로가기</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sponsor Modal (Feature 16: Sponsorship Banner Matching) */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              스폰서십 & 파트너사 크레딧 제휴 신청
            </h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              zemix의 수많은 테크 빌더 및 초기 스타트업에게 자사의 B2B SaaS, 클라우드 인프라, API 크레딧을 제공하고 홍보하세요.
            </p>

            {sponsorSubmitted ? (
              <div className="my-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <p className="text-sm font-bold text-emerald-500">제휴 신청이 정상적으로 접수되었습니다!</p>
                <p className="text-xs text-muted mt-1">담당자가 24시간 이내에 입력하신 이메일로 회신해 드립니다.</p>
                <button
                  onClick={() => {
                    setShowSponsorModal(false);
                    setSponsorSubmitted(false);
                  }}
                  className="mt-4 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  닫기
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSponsorSubmitted(true);
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">회사명 / 서비스명</label>
                  <input
                    required
                    placeholder="예: Supabase, AWS, Cloudflare"
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">담당자 업무용 이메일</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@company.com"
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">제공 가능한 혜택 내용</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="예: zemix 빌더에게 유료 플랜 2개월 무료 쿠폰 또는 $100 크레딧 제공"
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSponsorModal(false)}
                    className="rounded-control border border-border px-3.5 py-2 text-xs font-medium text-muted hover:text-foreground"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
                  >
                    제휴 제안 제출
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
