import React from "react";
import TemplatesClient from "./TemplatesClient";

export const metadata = {
  title: "빌더 템플릿 & 보일러플레이트 샵 | zemix",
  description: "사이드 프로젝트 개발 시간을 80% 단축해 주는 Next.js SaaS 보일러플레이트, UI 키트, 피그마 템플릿 마켓",
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
