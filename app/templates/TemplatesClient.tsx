"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Code2, Star, Download, ExternalLink, Plus, Check, Filter } from "lucide-react";
import { getTemplates } from "@/lib/storage";
import { TemplateItem } from "@/lib/types";

export default function TemplatesClient() {
  const [templates] = useState<TemplateItem[]>(getTemplates());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = ["All", "Boilerplate", "UI Kit", "Figma", "Notion", "API Starter"];

  const filtered =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <section className="border-b border-border bg-surface-muted/30 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Code2 className="h-3.5 w-3.5" />
            <span>시간을 아껴주는 스타터 키트</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            빌더 템플릿 & 보일러플레이트 마켓
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted max-w-2xl mx-auto">
            인증, 결제 연동, 반응형 UI를 밑바닥부터 구현하느라 지치셨나요? 검증된 풀스택 스타터 키트와 디자인 시스템으로 3일 만에 출시하세요.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              내 템플릿 / 보일러플레이트 공유하기
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="mx-auto max-w-5xl px-6 pt-10">
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-border">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === c
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-card border border-border bg-surface p-5 shadow-card hover:border-primary/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                    {item.category}
                  </span>
                  <span className="font-bold text-foreground bg-surface-muted px-2 py-0.5 rounded text-[11px]">
                    {item.price}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span key={t} className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-mono text-muted">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{item.starsCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={item.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-muted transition-colors inline-flex items-center gap-1"
                  >
                    <span>미리보기</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-control bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors inline-flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>받기</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Submit Template Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              템플릿 등록 및 공유
            </h3>
            <p className="mt-1 text-xs text-muted">
              직접 제작한 오픈소스 보일러플레이트 또는 디자인 에셋 링크를 zemix 빌더 커뮤니티에 공개하세요.
            </p>

            {submitted ? (
              <div className="my-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <p className="text-sm font-bold text-emerald-500">등록 신청이 완료되었습니다!</p>
                <p className="text-xs text-muted mt-1">에디터 검토 후 마켓 목록에 게시됩니다.</p>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSubmitted(false);
                  }}
                  className="mt-4 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  확인
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">템플릿 제목</label>
                  <input
                    required
                    placeholder="예: Supabase Auth & Next.js 15 Starter"
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">분류</label>
                    <select className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary">
                      <option>Boilerplate</option>
                      <option>UI Kit</option>
                      <option>Figma</option>
                      <option>Notion</option>
                      <option>API Starter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">가격 (또는 무료)</label>
                    <input
                      placeholder="예: 무료 (MIT), ₩19,000"
                      className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">깃허브 / 다운로드 링크</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/repo"
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">설명 요약</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="주요 기능, 포함된 라이브러리, 라이선스 등을 적어주세요."
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="rounded-control border border-border px-3.5 py-2 text-xs font-medium text-muted hover:text-foreground"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
                  >
                    등록 제출
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
