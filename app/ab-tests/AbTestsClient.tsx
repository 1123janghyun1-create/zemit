"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Vote, CheckCircle2, Plus, Sparkles, Eye, ThumbsUp } from "lucide-react";
import { getAbTests, voteAbTest } from "@/lib/storage";
import { AbTestItem } from "@/lib/types";

export default function AbTestsClient() {
  const [tests, setTests] = useState<AbTestItem[]>(getAbTests());
  const [showNewModal, setShowNewModal] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [imgA, setImgA] = useState("");
  const [titleA, setTitleA] = useState("");
  const [imgB, setImgB] = useState("");
  const [titleB, setTitleB] = useState("");

  const handleVote = (id: string, option: "A" | "B") => {
    const updated = voteAbTest(id, option);
    setTests(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !imgA || !imgB) return;
    const newItem: AbTestItem = {
      id: `ab-${Date.now()}`,
      title: titleInput,
      author: {
        id: "me",
        name: "내 프로필",
        handle: "maker",
        avatar: "/icon.png",
        bio: "",
        role: "Maker",
      },
      imageA: imgA,
      titleA: titleA || "Option A",
      votesA: 1,
      imageB: imgB,
      titleB: titleB || "Option B",
      votesB: 0,
      userVoted: "A",
      createdAt: new Date().toISOString().split("T")[0],
    };
    const nextList = [newItem, ...tests];
    setTests(nextList);
    try {
      localStorage.setItem("zemix_ab_tests", JSON.stringify(nextList));
    } catch {}
    setShowNewModal(false);
    setTitleInput("");
    setImgA("");
    setImgB("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="border-b border-border bg-surface-muted/30 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Vote className="h-3.5 w-3.5" />
            <span>UI/UX 블라인드 테스트</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            A/B 디자인 투표소 (Pick the Better UI)
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted max-w-2xl mx-auto">
            "버튼 색상 A vs B?", "다크모드 vs 라이트모드 랜딩페이지?" 실제 사용자들의 즉각적인 클릭 투표로 디자인 의사결정 고민을 10분 만에 끝내세요.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              내 디자인 A/B 투표 올리기
            </button>
          </div>
        </div>
      </section>

      {/* Tests Grid */}
      <main className="mx-auto max-w-5xl px-6 pt-10 space-y-10">
        {tests.map((test) => {
          const totalVotes = test.votesA + test.votesB;
          const pctA = totalVotes === 0 ? 50 : Math.round((test.votesA / totalVotes) * 100);
          const pctB = totalVotes === 0 ? 50 : 100 - pctA;

          return (
            <div
              key={test.id}
              className="rounded-card border border-border bg-surface p-6 shadow-card space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h2 className="text-base md:text-lg font-bold text-foreground">{test.title}</h2>
                  <p className="text-xs text-muted mt-0.5">
                    제안자: {test.author.name} • 총 {totalVotes}명 참여
                  </p>
                </div>
                {test.userVoted && (
                  <span className="self-start md:self-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Option {test.userVoted}에 투표 완료
                  </span>
                )}
              </div>

              {/* Side by side Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option A */}
                <div
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    test.userVoted === "A"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-surface-muted/30 hover:border-primary/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-black/20">
                      <img src={test.imageA} alt="Option A" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{test.titleA}</h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/80">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span className="font-bold text-primary">{pctA}%</span>
                      <span className="text-muted">{test.votesA}표</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface border border-border overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pctA}%` }} />
                    </div>

                    <button
                      onClick={() => handleVote(test.id, "A")}
                      className={`w-full mt-3 rounded-control py-2 text-xs font-semibold transition-all cursor-pointer ${
                        test.userVoted === "A"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-surface hover:bg-surface-muted text-foreground"
                      }`}
                    >
                      {test.userVoted === "A" ? "✓ A 선택됨" : "Option A에 투표"}
                    </button>
                  </div>
                </div>

                {/* Option B */}
                <div
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    test.userVoted === "B"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-surface-muted/30 hover:border-primary/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-black/20">
                      <img src={test.imageB} alt="Option B" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{test.titleB}</h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/80">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span className="font-bold text-emerald-500">{pctB}%</span>
                      <span className="text-muted">{test.votesB}표</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface border border-border overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pctB}%` }} />
                    </div>

                    <button
                      onClick={() => handleVote(test.id, "B")}
                      className={`w-full mt-3 rounded-control py-2 text-xs font-semibold transition-all cursor-pointer ${
                        test.userVoted === "B"
                          ? "bg-emerald-500 text-white"
                          : "border border-border bg-surface hover:bg-surface-muted text-foreground"
                      }`}
                    >
                      {test.userVoted === "B" ? "✓ B 선택됨" : "Option B에 투표"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Post Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              새 A/B 디자인 투표 등록
            </h3>
            <p className="mt-1 text-xs text-muted">
              비교하고 싶은 2개의 UI 캡처 이미지 URL과 설명을 입력해 주세요.
            </p>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">투표 질문 / 주제</label>
                <input
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="예: 결제 전환율을 높이기 위한 플랜 카드 디자인 어떤 게 더 낫나요?"
                  className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 border border-border rounded-xl p-3 bg-surface-muted/30">
                  <span className="text-xs font-bold text-primary">Option A</span>
                  <input
                    required
                    value={titleA}
                    onChange={(e) => setTitleA(e.target.value)}
                    placeholder="설명 (예: 2열 그리드)"
                    className="w-full rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                  <input
                    required
                    type="url"
                    value={imgA}
                    onChange={(e) => setImgA(e.target.value)}
                    placeholder="이미지 URL A"
                    className="w-full rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-2 border border-border rounded-xl p-3 bg-surface-muted/30">
                  <span className="text-xs font-bold text-emerald-500">Option B</span>
                  <input
                    required
                    value={titleB}
                    onChange={(e) => setTitleB(e.target.value)}
                    placeholder="설명 (예: 가로 아코디언)"
                    className="w-full rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                  <input
                    required
                    type="url"
                    value={imgB}
                    onChange={(e) => setImgB(e.target.value)}
                    placeholder="이미지 URL B"
                    className="w-full rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-control border border-border px-3.5 py-2 text-xs font-medium text-muted hover:text-foreground"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
                >
                  투표 개설하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
