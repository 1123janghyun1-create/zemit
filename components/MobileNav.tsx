"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Activity, Users, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { language, t } = useLanguage();

  const items = [
    { label: language === "ko" ? "홈" : "Home", href: "/", icon: Home },
    { label: t("nav.explore"), href: "/explore", icon: Compass },
    { label: t("nav.activity"), href: "/activity", icon: Activity },
    { label: t("nav.builders"), href: "/builders", icon: Users },
    { label: t("nav.community"), href: "/community", icon: MessageSquare },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors duration-200 ${
              isActive ? "text-primary font-semibold" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

