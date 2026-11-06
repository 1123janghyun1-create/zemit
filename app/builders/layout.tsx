import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "빌더들 (Builders)",
  description:
    "zemix에서 사이드 프로젝트를 만들고 키워나가는 열정적인 메이커들을 만나보세요.",
  openGraph: {
    title: "빌더들 (Builders) | zemix",
    description: "zemix에서 사이드 프로젝트를 만드는 메이커들을 만나보세요.",
    url: "/builders",
  },
};

export default function BuildersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
