import type { Metadata } from "next";
import IdeasClient from "./IdeasClient";

export const metadata: Metadata = {
  title: "아이디어 묘지 & 부활 (Fork) — zemix",
  description:
    "시간이 없어서 멈춘 사이드 프로젝트와 아이디어를 오픈 기부하고, 다른 빌더가 이어받아(Fork) 세상에 출시하는 오픈 기부 공간입니다.",
  openGraph: {
    title: "아이디어 묘지 & 부활 (Fork) — zemix",
    description: "시간이 없어서 멈춘 프로젝트를 기부하고 다른 빌더가 이어받아 완성하세요.",
  },
};

export default function IdeasPage() {
  return <IdeasClient />;
}
