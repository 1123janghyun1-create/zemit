"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Command, Heart, HelpCircle, X, Sparkles, Dices, ArrowRight } from "lucide-react";

export default function GlobalShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        const list = data.projects || (Array.isArray(data) ? data : []);
        setProjects(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        if (e.key === "Escape") {
          setShowQuickSearch(false);
          setShowHelp(false);
        }
        return;
      }

      // Cmd+K or Ctrl+K: Quick search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowQuickSearch((prev) => !prev);
        return;
      }

      // '?' key: Help modal
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Escape: Close all
      if (e.key === "Escape") {
        setShowQuickSearch(false);
        setShowHelp(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, projects]);

  const filteredProjects = searchQuery.trim()
    ? projects.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : projects.slice(0, 5);

  return (
    <>
      {/* Quick Search Modal (Cmd+K) */}
      {showQuickSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Search className="h-5 w-5 text-muted" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="프로젝트, 태그, 빌더 검색... (Esc로 닫기)"
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted"
              />
              <button
                onClick={() => setShowQuickSearch(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
              {filteredProjects.length === 0 ? (
                <p className="p-4 text-center text-xs text-muted">검색 결과가 없습니다.</p>
              ) : (
                filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setShowQuickSearch(false);
                      router.push(`/projects/${p.id}`);
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-surface-muted"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.logo || "/icon.svg"}
                        alt={p.title}
                        className="h-7 w-7 rounded-lg border border-border object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{p.title}</p>
                        <p className="text-[11px] text-muted truncate max-w-sm">{p.tagline}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted" />
                  </button>
                ))
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted">
              <span>단축키: <b>Cmd/Ctrl + K</b>로 언제든 열기</span>
              <span><b>Esc</b> 닫기</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Cheat Sheet (?) */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Command className="h-4 w-4 text-primary" />
                개발자 단축키 안내 (Shortcuts)
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-muted">글로벌 빠른 검색창 열기</span>
                <kbd className="rounded bg-surface-muted px-2 py-1 font-mono font-semibold text-foreground border border-border">
                  Cmd / Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-muted">단축키 도움말 보기</span>
                <kbd className="rounded bg-surface-muted px-2 py-1 font-mono font-semibold text-foreground border border-border">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-muted">프로젝트 상세에서 좋아요(하트) 토글</span>
                <kbd className="rounded bg-surface-muted px-2 py-1 font-mono font-semibold text-foreground border border-border">
                  L
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted">팝업 및 모달 닫기</span>
                <kbd className="rounded bg-surface-muted px-2 py-1 font-mono font-semibold text-foreground border border-border">
                  Esc
                </kbd>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
