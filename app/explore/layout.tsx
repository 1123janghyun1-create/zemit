import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로젝트 탐색",
  description:
    "zemix에서 다양한 메이커들이 런칭한 혁신적인 사이드 프로젝트들을 둘러보고 초기 유저가 되어 피드백을 남겨보세요.",
  openGraph: {
    title: "프로젝트 탐색 | zemix",
    description: "zemix에서 런칭된 다양한 사이드 프로젝트를 탐색해보세요.",
    url: "/explore",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
