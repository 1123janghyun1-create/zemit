import React from "react";
import ChallengesClient from "./ChallengesClient";

export const metadata = {
  title: "월간 빌더 챌린지 & 스프린트 | zemix",
  description: "7일 안에 MVP 배포하기, 첫 유료 고객 만들기 등 인디 메이커들의 성장을 돕는 스프린트 챌린지",
};

export default function ChallengesPage() {
  return <ChallengesClient />;
}
