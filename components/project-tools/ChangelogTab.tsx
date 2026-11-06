"use client";

import React, { useState } from "react";
import { History, Plus, CheckCircle2, Calendar, Tag } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  notes: string[];
}

const DEFAULT_CHANGELOGS: ChangelogEntry[] = [
  {
    version: "v1.2.0",
    date: "2026-10-22",
    title: "구글봇 크롤링 최적화 & 실시간 조회수 연동",
    notes: [
      "검색엔진 최적화(SEO) 및 Schema.org 구조화 데이터 적용",
      "프로젝트 클릭 시 실시간 조회수 카운팅 및 Supabase DB 영구 동기화",
      "외부 공식 웹사이트 직접 연결 a 태그 및 307 리다이렉트 지원",
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-10-15",
    title: "피드백 및 실시간 좋아요 시스템 개편",
    notes: [
      "방문자 응원하기(하트) 실시간 반영",
      "카테고리별 피드백/제안 작성 기능 추가",
      "빌더 프로필 상세 페이지 오픈",
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-10-01",
    title: "첫 공식 MVP 런칭 🎉",
    notes: [
      "zemix 쇼케이스 플랫폼에 프로젝트 최초 배포",
      "주요 기능 시연 데모 및 스택 태그 등록",
    ],
  },
];

interface ChangelogTabProps {
  isOwner?: boolean;
}

export default function ChangelogTab({ isOwner }: ChangelogTabProps) {
  const [logs, setLogs] = useState<ChangelogEntry[]>(DEFAULT_CHANGELOGS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!version || !title) return;
    const newEntry: ChangelogEntry = {
      version,
      title,
      date: new Date().toISOString().slice(0, 10),
      notes: noteText.split("\n").filter((n) => n.trim().length > 0),
    };
    setLogs([newEntry, ...logs]);
    setVersion("");
    setTitle("");
    setNoteText("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <span>프로젝트 체인지로그 & 업데이트 기록</span>
          </h3>
          <p className="text-xs text-muted mt-0.5">
            이 프로젝트가 버전별로 어떻게 성장해 왔는지 확인해 보세요.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>새 업데이트 기록</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-primary/30 bg-surface p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">버전 (예: v1.3.0)</label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.3.0"
                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">업데이트 제목</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="새로운 기능 출시"
                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted block mb-1">상세 내용 (줄바꿈으로 구분)</label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="- 다크모드 추가&#10;- 결제 버그 수정"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-border px-3 py-1.5 text-xs text-muted"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              기록 저장
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div className="relative border-l-2 border-border ml-3 pl-6 space-y-8">
        {logs.map((log, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-colors" />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-primary-soft px-2 py-0.5 font-mono text-xs font-bold text-primary">
                  {log.version}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted">
                  <Calendar className="h-3 w-3" />
                  <span>{log.date}</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-foreground mt-2">{log.title}</h4>

              <ul className="mt-2 space-y-1 text-xs text-foreground/80">
                {log.notes.map((note, nIdx) => (
                  <li key={nIdx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
