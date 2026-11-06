import React from "react";
import AbTestsClient from "./AbTestsClient";

export const metadata = {
  title: "A/B 디자인 투표소 (Pick the Better UI) | zemix",
  description: "사이드 프로젝트 UI/UX 디자인 후보 A와 B 중 어떤 것이 더 나은지 실시간으로 투표하고 피드백을 받는 블라인드 테스트 관",
};

export default function AbTestsPage() {
  return <AbTestsClient />;
}
