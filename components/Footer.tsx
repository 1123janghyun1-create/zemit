"use client";

import React from "react";
import Link from "next/link";
import { HexagonLogo } from "@/components/Icons";
import { Compass, Trophy, Users, MessageSquare, Info } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted/40 py-10 mt-20 pb-20 md:pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand Slogan */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface border border-border text-foreground shadow-sm group-hover:scale-105 transition-transform">
                <HexagonLogo className="h-4.5 w-4.5 text-foreground group-hover:text-primary transition-colors" strokeWidth={2.2} />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                zemix
              </span>
            </Link>
            <span className="hidden sm:inline-block text-xs text-muted border-l border-border pl-3">
              유저를 만나고, 함께 만드는 사이드 프로젝트 쇼케이스
            </span>
          </div>

          {/* Clean Main Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted">
            <Link href="/explore" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>프로젝트 탐색</span>
            </Link>
            <Link href="/leaderboard" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>명예의 전당</span>
            </Link>
            <Link href="/builders" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <span>메이커스</span>
            </Link>
            <Link href="/community" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
              <span>커뮤니티</span>
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-purple-500" />
              <span>소개</span>
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground text-center md:text-right">
            © 2026 zemix. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
