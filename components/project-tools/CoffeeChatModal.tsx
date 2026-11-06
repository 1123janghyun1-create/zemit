"use client";

import React, { useState } from "react";
import { X, Coffee, Send, CheckCircle2, Heart } from "lucide-react";
import { Builder } from "@/lib/types";

interface CoffeeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  builder: Builder;
  projectTitle: string;
}

export default function CoffeeChatModal({ isOpen, onClose, builder, projectTitle }: CoffeeChatModalProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Coffee className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">빌더와 커피챗 & 후원</h3>
              <p className="text-xs text-muted">{builder.name}님에게 15분 티타임 신청하기</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-foreground">커피챗 요청이 전송되었습니다!</h4>
            <p className="text-xs text-muted mt-1">빌더가 연락처를 확인하고 회신할 예정입니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="rounded-xl bg-surface-muted p-3 border border-border/60 flex items-center gap-3">
              <img
                src={builder.avatar}
                alt={builder.name}
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
              <div>
                <p className="text-xs font-bold text-foreground">{builder.name}</p>
                <p className="text-[11px] text-muted">‘{projectTitle}’ 메이커</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">내 이름 또는 닉네임</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">회신받을 연락처 (이메일/오픈채팅/X)</label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@example.com 또는 @twitter"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">나누고 싶은 이야기 (15분 티타임)</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="프로젝트 잘 보았습니다! 피드백을 나누거나 가볍게 이야기 나누고 싶습니다."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Donation Quick Link */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <span className="text-xs text-foreground font-semibold">커피 한 잔 후원하기</span>
              </div>
              <a
                href="https://toss.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-500 hover:underline"
              >
                토스로 커피 후원 ☕
              </a>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted hover:bg-surface-muted"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>커피챗 신청하기</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
