import type { Metadata } from "next";
import UpcomingClient from "./UpcomingClient";

export const metadata: Metadata = {
  title: "사이드 프로젝트 런칭 D-Day & 사전 등록 — zemix",
  description:
    "배포를 앞두고 열심히 개발 중인 사이드 프로젝트들의 출시 D-Day와 사전 알림 등록 허브입니다.",
  openGraph: {
    title: "사이드 프로젝트 런칭 D-Day & 사전 등록 — zemix",
    description: "출시 예정인 사이드 프로젝트를 둘러보고 얼리어답터 사전 알림을 등록하세요.",
  },
};

export default function UpcomingPage() {
  return <UpcomingClient />;
}
