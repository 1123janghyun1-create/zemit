import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "커뮤니티 라운지",
  description:
    "사이드 프로젝트 메이커들과 함께 나누는 개발 이야기, 질문, 팀원 모집, 런칭 소식 커뮤니티 공간입니다.",
  openGraph: {
    title: "커뮤니티 라운지 | zemix",
    description: "사이드 프로젝트 메이커들과 함께 소통하고 피드백을 나눠보세요.",
    url: "/community",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
