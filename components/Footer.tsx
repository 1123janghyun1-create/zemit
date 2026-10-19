import React from "react";
import Link from "next/link";
import { HexagonLogo } from "@/components/Icons";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted/50 py-10 mt-16 pb-24 md:pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-surface border border-border text-foreground shadow-sm">
              <HexagonLogo className="h-4 w-4 text-foreground" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-bold tracking-tight text-foreground">
              zemit
            </span>
            <span className="text-xs text-muted ml-2">
              — Meet users. Build together.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-muted">
            <Link href="/explore" className="hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link href="/builders" className="hover:text-foreground transition-colors">
              Builders
            </Link>
            <Link href="/community" className="hover:text-foreground transition-colors">
              Community
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-xs text-muted-foreground text-center md:text-right">
            © 2026 Zemit. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

