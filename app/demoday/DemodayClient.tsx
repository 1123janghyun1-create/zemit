"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Building2, Users, ExternalLink, Play, Plus, Award } from "lucide-react";
import { getProjects } from "@/lib/storage";
import DemoVideoModal from "@/components/DemoVideoModal";

export default function DemodayClient() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [applied, setApplied] = useState(false);
  const projects = getProjects();

  const cohorts = [
    { id: "All", name: "전체 부스" },
    { id: "likelion", name: "🦁 멋쟁이사자처럼 13기" },
    { id: "depromeet", name: "⚡ 디프만 16기" },
    { id: "sparta", name: "🚀 스파르타 내일배움캠프" },
    { id: "univ", name: "🎓 대학 연합 동아리" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="border-b border-border bg-surface-muted/30 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Building2 className="h-3.5 w-3.5" />
            <span>동아리 & 부트캠프 가상 엑스포</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            가상 부스 데모데이 (Virtual Expo)
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted max-w-2xl mx-auto">
            수료전, 해커톤, 데모데이에 출품된 치열한 팀 프로젝트들을 둘러보고 실제 웹앱을 바로 체험해 보세요.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowDemoVideo(true)}
              className="inline-flex items-center gap-2 rounded-control bg-gradient-to-r from-primary via-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white text-white" />
              <span>🎬 60초 시연 영상 (Demo Video)</span>
            </button>
            <button
              onClick={() => setShowApplyModal(true)}
              className="inline-flex items-center gap-2 rounded-control border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>우리 동아리 / 부트캠프 전용관 개설 신청</span>
            </button>
          </div>
        </div>
      </section>

      {/* Cohort Tabs */}
      <main className="mx-auto max-w-5xl px-6 pt-10">
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-border">
          {cohorts.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`rounded-control px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === c.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Booth Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {projects.length > 0 ? (
            projects.map((p, idx) => (
              <div
                key={p.id}
                className="rounded-card border border-border bg-surface p-5 shadow-card hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border bg-black/20 mb-4">
                    <img
                      src={p.coverImage || p.logo || "/icon.png"}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-white/20">
                      부스 #{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">
                    {p.tagline}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={p.author?.avatar || "/icon.png"}
                      alt={p.author?.name}
                      className="h-6 w-6 rounded-full border border-border object-cover"
                    />
                    <span className="text-xs text-muted">{p.author?.name} 팀</span>
                  </div>
                  <Link
                    href={`/projects/${p.id}`}
                    className="rounded-control bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 px-3 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-1"
                  >
                    <span>부스 방문</span>
                    <Play className="h-3 w-3 fill-current" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-xs text-muted rounded-card border border-dashed border-border bg-surface-muted/20">
              현재 참여 중인 데모데이 부스가 준비 중입니다.
            </div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              단체 / 부트캠프 데모데이 전용관 신청
            </h3>
            <p className="mt-1 text-xs text-muted">
              동아리, 학회, 부트캠프 수료 데모데이를 zemix 온라인 엑스포로 개최하세요.
            </p>

            {applied ? (
              <div className="my-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <p className="text-sm font-bold text-emerald-500">개설 신청이 완료되었습니다!</p>
                <p className="text-xs text-muted mt-1">운영팀이 24시간 내로 단체 전용관을 세팅해 드립니다.</p>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplied(false);
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
                  setApplied(true);
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">기관 / 동아리명</label>
                  <input
                    required
                    placeholder="예: 디프만 17기, 멋쟁이사자처럼 서울대 지부"
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">예상 출품 팀 수</label>
                  <input
                    type="number"
                    required
                    defaultValue={10}
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">담당자 연락처 (이메일/전화번호)</label>
                  <input
                    required
                    placeholder="contact@cohort.org"
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="rounded-control border border-border px-3.5 py-2 text-xs font-medium text-muted hover:text-foreground"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
                  >
                    신청 제출
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Official Product Demo Video Modal */}
      <DemoVideoModal
        isOpen={showDemoVideo}
        onClose={() => setShowDemoVideo(false)}
      />
    </div>
  );
}
